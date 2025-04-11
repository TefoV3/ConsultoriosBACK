import { User } from "../schemas/User.js"; // Nombre traducido del esquema
import { InitialConsultations } from "../schemas/Initial_Consultations.js";
import { AuditModel } from "../models/AuditModel.js";
import { sequelize } from "../database/database.js";
import { InitialConsultationsModel } from "./InitialConsultationsModel.js";


export class UserModel {

    static async getAll() {
        try {
            return await User.findAll({ where: { User_IsDeleted: false } });
        } catch (error) {
            throw new Error(`Error retrieving users: ${error.message}`);
        }
    }
    static async getUsersWithSocialWork() {
        try {
            const users = await User.findAll({
                attributes: [
                   "User_ID",
                    "User_FirstName",
                    "User_LastName"
                ],
                include: [
                    {
                        model: InitialConsultations,
                        attributes: ["Init_Code"],
                        include: [
                            {
                                model: sequelize.models.SocialWork, // Adjust the model name if necessary
                                attributes: ["SW_ProcessNumber", "SW_Status"]
                           }
                        ]
                   }
                ],
                order: [
                    ["User_LastName", "ASC"],
                    ["User_FirstName", "ASC"]
                ]
            });    
            return users;
        } catch (error) {
            console.error("Error fetching users with social work:", error);
            throw new Error("Database error when fetching users with social work");
        }
    }

    static async getById(id) {
        try {
            return await User.findOne({
                where: { User_ID: id, User_IsDeleted: false }
            });
        } catch (error) {
            throw new Error(`Error retrieving user: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // ✅ Crear usuario
            const newUser = await User.create(data);

            // ✅ Registrar en Audit quién creó el usuario
            await AuditModel.registerAudit(
                internalId, 
                "INSERT",
                "User",
                `El usuario interno ${internalId} creó al usuario ${data.User_ID}`
            );

            return newUser;
        } catch (error) {
            throw new Error(`Error al crear usuario: ${error.message}`);
        }
    }

    static async update(id, data, internalId) {
        try {
            const user = await this.getById(id);
            if (!user) return null;

            

            const [rowsUpdated] = await User.update(data, {
                where: { User_ID: id, User_IsDeleted: false }
            });
            await user.update(data, { individualHooks: true });

            await AuditModel.registerAudit(
                internalId, 
                "UPDATE",
                "User",
                `El usuario interno ${internalId} actualizó al usuario ${id}`
            );

            if (rowsUpdated === 0) return null;
            return await this.getById(id);

        } catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            if (!id) {
                throw new Error("The User_ID field is required to delete a user");
            }
    
            const user = await this.getById(id);
            if (!user) return null;
    
            await User.update(
                { User_IsDeleted: true }, // Esto activa el hook
                { where: { User_ID: id, User_IsDeleted: false } }
            );

            await AuditModel.registerAudit(
                internalId, 
                "DELETE",
                "User",
                `El usuario interno ${internalId} eliminó lógicamente al usuario ${id}`
            );
    
            return user;
        } catch (error) {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }
    
}
import { User } from "../schemas/User.js"; // Nombre traducido del esquema
import { InitialConsultations } from "../schemas/Initial_Consultations.js";
import { AuditModel } from "../models/AuditModel.js";
import { getUserId } from '../sessionData.js';

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
                    include: [
                        {
                            model: InitialConsultations,
                            attributes: ["Init_Code", "Init_SocialWork"],
                            where: { Init_SocialWork: true }
                        }
                    ]
                });
    
                return users;
            } catch (error) {
                throw new Error(`Error retrieving users with social work: ${error.message}`);
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

    static async getDocumentById(id) {
        try {
            return await User.findOne({
                attributes: ['User_HealthDocuments'],
                where: { User_ID: id }
            });
        } catch (error) {
            throw new Error(`Error retrieving document: ${error.message}`);
        }
    }





    static async create(data) {
        try {
            // ✅ Crear usuario
            const userId = getUserId();
            const newUser = await User.create(data);
            

            // ✅ Registrar en Audit quién creó el usuario
            await AuditModel.registerAudit(
                userId, 
                "INSERT",
                "User",
                `El usuario interno ${userId} creó al usuario ${data.User_ID}`
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
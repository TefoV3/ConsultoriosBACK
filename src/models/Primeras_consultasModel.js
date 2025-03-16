import { sequelize } from "../database/database.js";
import { InitialConsultations } from "../schemas/Primeras_consultas.js";
import { User } from "../schemas/Usuario.js";
import { InternalUser } from "../schemas/Usuario_interno.js";

export class InitialConsultationsModel {

    static async getAll() {
        try {
            return await InitialConsultations.findAll();
        } catch (error) {
            throw new Error(`Error retrieving initial consultations: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await InitialConsultations.findOne({
                where: { Initial_Code: id }
            });
        } catch (error) {
            throw new Error(`Error retrieving initial consultation: ${error.message}`);
        }
    }

    static async createInitialConsultation(data) {
        const t = await sequelize.transaction(); // Inicia una transacción
        let userCreated = false;

        try {
            // Verificar si el usuario externo existe, si no, crearlo
            let user = await User.findOne({ where: { User_ID: data.User_ID }, transaction: t });
            if (!user) {
                user = await User.create({
                    User_ID: data.User_ID,
                    User_FirstName: data.User_FirstName,
                    User_LastName: data.User_LastName,
                    User_Email: data.User_Email,
                    User_Phone: data.User_Phone,
                    User_Gender: data.User_Gender,
                    User_Ethnicity: data.User_Ethnicity,
                    User_Education: data.User_Education,
                    User_Occupation: data.User_Occupation,
                    User_Address: data.User_Address,
                    User_Nationality: data.User_Nationality,
                    User_Dependents: data.User_Dependents,
                    User_Sector: data.User_Sector,
                    User_Zone: data.User_Zone,
                    User_MaritalStatus: data.User_MaritalStatus,
                    User_Disability: data.User_Disability,
                    User_Benefits: data.User_Benefits,
                    User_BirthDate: data.User_BirthDate,
                    User_IncomeLevel: data.User_IncomeLevel,
                    User_Age: data.User_Age,
                    User_FamilyIncome: data.User_FamilyIncome,
                    User_OwnsHouse: data.User_OwnsHouse,
                    User_OwnsCar: data.User_OwnsCar,
                    User_ReferenceName: data.User_ReferenceName,
                    User_ReferencePhone: data.User_ReferencePhone,
                }, { transaction: t });
                userCreated = true; // Marcar que el usuario fue creado en esta transacción
            }

            // Verificar si el usuario interno existe
            const internalUser = await InternalUser.findOne({ where: { Internal_ID: data.Internal_ID }, transaction: t });
            if (!internalUser) {
                throw new Error(`El usuario interno con ID ${data.Internal_ID} no existe.`);
            }

            // Crear la consulta inicial
            const newConsultation = await InitialConsultations.create({
                Init_Code: data.Init_Code,
                Internal_ID: data.Internal_ID,
                User_ID: data.User_ID,
                Init_ClientType: data.Init_ClientType,
                Init_Date: data.Init_Date,
                Init_Subject: data.Init_Subject,
                Init_Lawyer: data.Init_Lawyer,
                Init_Province: data.Init_Province,
                Init_Notes: data.Init_Notes,
                Init_Office: data.Init_Office,
                Init_Topic: data.Init_Topic,
                Init_Referral: data.Init_Referral,
                Init_Status: data.Init_Status,
                Init_City: data.Init_City,
            }, { transaction: t });

            await t.commit(); // Confirmar la transacción
            return { message: "Consulta inicial creada exitosamente", data: newConsultation };
        } catch (error) {
            await t.rollback(); // Revertir la transacción en caso de error
            if (userCreated) {
                // Eliminar el usuario creado si se genera un error
                await User.destroy({ where: { User_ID: data.User_ID } });
            }
            throw new Error(`Error al crear la consulta inicial: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const consultation = await this.getById(id);
            if (!consultation) return null;

            const [rowsUpdated] = await InitialConsultations.update(data, {
                where: { Initial_Code: id }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating initial consultation: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const consultation = await this.getById(id);
            if (!consultation) return null;

            await InitialConsultations.destroy({ where: { Initial_Code: id } });
            return consultation;
        } catch (error) {
            throw new Error(`Error deleting initial consultation: ${error.message}`);
        }
    }
}
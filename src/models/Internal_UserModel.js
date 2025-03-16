import { InternalUser } from "../schemas/Internal_User.js"; 

export class InternalUserModel {

    static async getAll() {
        try {
            return await InternalUser.findAll();
        } catch (error) {
            throw new Error(`Error retrieving internal users: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await InternalUser.findOne({
                where: { Internal_ID: id }
            });
        } catch (error) {
            throw new Error(`Error retrieving internal user: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await InternalUser.create(data);
        } catch (error) {
            throw new Error(`Error creating internal user: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const internalUser = await this.getById(id);
            if (!internalUser) return null;

            const [rowsUpdated] = await InternalUser.update(data, {
                where: { Internal_ID: id }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating internal user: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const internalUser = await this.getById(id);
            if (!internalUser) return null;

            await InternalUser.destroy({ where: { Internal_ID: id } });
            return internalUser;
        } catch (error) {
            throw new Error(`Error deleting internal user: ${error.message}`);
        }
    }
}

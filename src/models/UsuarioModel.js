import { User } from "../schemas/Usuario.js"; // Nombre traducido del esquema

export class UserModel {

    static async getAll() {
        try {
            return await User.findAll({ where: { IsDeleted: false } });
        } catch (error) {
            throw new Error(`Error retrieving users: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await User.findOne({
                where: { User_ID: id, IsDeleted: false }
            });
        } catch (error) {
            throw new Error(`Error retrieving user: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await User.create(data);
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const user = await this.getById(id);
            if (!user) return null;

            const [rowsUpdated] = await User.update(data, {
                where: { User_ID: id, IsDeleted: false }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            // Ensure the ID is not empty
            if (!id) {
                throw new Error("The User_ID field is required to delete a user");
            }

            const user = await this.getById(id);
            if (!user) return null;

            await User.update(
                { IsDeleted: true },
                { where: { User_ID: id, IsDeleted: false } }
            );
            return user;
        } catch (error) {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }
}

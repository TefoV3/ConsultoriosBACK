import { InternalUser } from "../Internal_User.js";
import { Periodo } from "./Periodo_schema.js";
import { UsuarioXPeriodo } from "./UsuarioXPeriodo_schema.js";
import { Resumen_Horas_Estudiantes } from "./Resumen_Horas_Estudiantes_schema.js";
import { Horas_Extraordinarias } from "./Horas_Extraordinarias_schema.js";
import { Seguimiento_Semanal } from "./Seguimiento_Semanal_schema.js";
import { Horarios } from "./Horario_schema.js";
import { Registro_Asistencia } from "./Registro_Asistencia_Schema.js";
/* 🔹 Relación N:M entre InternalUser y Periodo a través de UsuarioXPeriodo */
InternalUser.belongsToMany(Periodo, { 
    through: UsuarioXPeriodo, 
    foreignKey: "Internal_ID",
    as: "periodos"
});

Periodo.belongsToMany(InternalUser, { 
    through: UsuarioXPeriodo, 
    foreignKey: "Periodo_ID",
    as: "usuarios"
});

/* 🔹 Relación 1:N entre InternalUser y UsuarioXPeriodo */
InternalUser.hasMany(UsuarioXPeriodo, { 
    foreignKey: "Internal_ID",
    as: "usuarioPeriodos"
});

UsuarioXPeriodo.belongsTo(InternalUser, { 
    foreignKey: "Internal_ID",
    as: "usuario"
});

/* 🔹 Relación 1:N entre Periodo y UsuarioXPeriodo */
Periodo.hasMany(UsuarioXPeriodo, { 
    foreignKey: "Periodo_ID",
    as: "periodoUsuarios"
});

UsuarioXPeriodo.belongsTo(Periodo, { 
    foreignKey: "Periodo_ID",
    as: "periodo"
});

/* 🔹 Relación 1:N entre InternalUser y Resumen_Horas_Estudiantes */
InternalUser.hasMany(Resumen_Horas_Estudiantes, { 
    foreignKey: "Internal_ID",
    as: "resumenHoras"
});

Resumen_Horas_Estudiantes.belongsTo(InternalUser, { 
    foreignKey: "Internal_ID",
    as: "usuarioResumen"
});

/* 🔹 Relación 1:N entre InternalUser y Horas_Extraordinarias */
InternalUser.hasMany(Horas_Extraordinarias, { 
    foreignKey: "Internal_ID",
    as: "horasExtraordinarias"
});

Horas_Extraordinarias.belongsTo(InternalUser, { 
    foreignKey: "Internal_ID",
    as: "usuarioHorasExtra"
});

/* 🔹 Relación 1:N entre Periodo y Seguimiento_Semanal */
Periodo.hasMany(Seguimiento_Semanal, {
    foreignKey: "Periodo_ID",
    as: "seguimientos"
});

Seguimiento_Semanal.belongsTo(Periodo, {
    foreignKey: "Periodo_ID",
    as: "periodoSeguimiento"
});

/* 🔹 Un `UsuarioXPeriodo` puede tener muchos `Horarios` */
UsuarioXPeriodo.hasMany(Horarios, { 
    foreignKey: "UsuarioXPeriodo_ID",
    as: "horarios"
});

/* 🔹 Un `Horario` pertenece a un `UsuarioXPeriodo` */
Horarios.belongsTo(UsuarioXPeriodo, { 
    foreignKey: "UsuarioXPeriodo_ID",
    as: "usuarioXPeriodo",
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

/* 🔹 Un `UsuarioXPeriodo` puede tener muchos `Registros_Asistencia` */
UsuarioXPeriodo.hasMany(Registro_Asistencia, { 
    foreignKey: "UsuarioXPeriodo_ID",
    as: "registrosAsistencia"
});

/* 🔹 Un `Registro_Asistencia` pertenece a un `UsuarioXPeriodo` */
Registro_Asistencia.belongsTo(UsuarioXPeriodo, { 
    foreignKey: "UsuarioXPeriodo_ID",
    as: "usuarioXPeriodo",
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

console.log("📌 Relaciones de Sequelize con InternalUser establecidas correctamente.");

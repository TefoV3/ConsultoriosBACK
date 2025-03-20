import { Router } from "express";
import { ParametersController } from "../controllers/ParametersController.js";

export const ParametersRouter = Router();
/*ZONE --> SECTOR*/ 
ParametersRouter.get("/parameters/zone/:zone", ParametersController.getByZone);
ParametersRouter.post("/parameters", ParametersController.create);
ParametersRouter.put("/parameters/:zone/:sector", ParametersController.update);
ParametersRouter.delete("/parameters/:id", ParametersController.delete);
/*Province*/ 
ParametersRouter.post("/parameters/province", ParametersController.createProvince); 
ParametersRouter.get("/parameters/provinces", ParametersController.getAllProvince); 
ParametersRouter.put("/parameters/province/:id", ParametersController.updateProvince); 
ParametersRouter.delete("/parameters/province/:id", ParametersController.deleteProvince);
/* City */
ParametersRouter.post("/parameters/city", ParametersController.createCity);
ParametersRouter.get("/parameters/cities", ParametersController.getAllCity);
ParametersRouter.put("/parameters/city/:id", ParametersController.updateCity);
ParametersRouter.delete("/parameters/city/:id", ParametersController.deleteCity);
/* Country */
ParametersRouter.post("/parameters/country", ParametersController.createCountry); // Crear un nuevo país
ParametersRouter.get("/parameters/countries", ParametersController.getAllCountry); // Obtener todos los países
ParametersRouter.put("/parameters/country/:id", ParametersController.updateCountry); // Actualizar un país por ID
ParametersRouter.delete("/parameters/country/:id", ParametersController.deleteCountry); // Eliminar un país por ID
/* Ethnicity */
ParametersRouter.post("/parameters/ethnicity", ParametersController.createEthnicity); // Crear una nueva etnia
ParametersRouter.get("/parameters/ethnicities", ParametersController.getAllEthnicity); // Obtener todas las etnias
ParametersRouter.put("/parameters/ethnicity/:id", ParametersController.updateEthnicity); // Actualizar una etnia por ID
ParametersRouter.delete("/parameters/ethnicity/:id", ParametersController.deleteEthnicity); // Eliminar una etnia por ID
/* Marital Status */
ParametersRouter.post("/parameters/marital-status", ParametersController.createMaritalStatus); // Crear un nuevo estado civil
ParametersRouter.get("/parameters/marital-statuses", ParametersController.getAllMaritalStatus); // Obtener todos los estados civiles no nulos
ParametersRouter.put("/parameters/marital-status/:id", ParametersController.updateMaritalStatus); // Actualizar un estado civil por ID
ParametersRouter.delete("/parameters/marital-status/:id", ParametersController.deleteMaritalStatus); // Eliminar un estado civil por ID
/* Gender */
ParametersRouter.post("/parameters/gender", ParametersController.createGender); // Crear un nuevo género
ParametersRouter.get("/parameters/genders", ParametersController.getAllGender); // Obtener todos los géneros no nulos
ParametersRouter.put("/parameters/gender/:id", ParametersController.updateGender); // Actualizar un género por ID
ParametersRouter.delete("/parameters/gender/:id", ParametersController.deleteGender); // Eliminar un género por ID
/* ReferredBy */
ParametersRouter.post("/parameters/referredBy", ParametersController.createReferredBy); // Crear un nuevo referido
ParametersRouter.get("/parameters/referredBy", ParametersController.getAllReferredBy); // Obtener todos los referidos no nulos
ParametersRouter.put("/parameters/referredBy/:id", ParametersController.updateReferredBy); // Actualizar un referido por ID
ParametersRouter.delete("/parameters/referredBy/:id", ParametersController.deleteReferredBy); // Eliminar un referido por ID
/* Education Level */
ParametersRouter.post("/parameters/educationLevel", ParametersController.createEducationLevel);
ParametersRouter.get("/parameters/educationLevels", ParametersController.getAllEducationLevels);
ParametersRouter.put("/parameters/educationLevel/:id", ParametersController.updateEducationLevel);
ParametersRouter.delete("/parameters/educationLevel/:id", ParametersController.deleteEducationLevel);
/* Occupation */
ParametersRouter.post("/parameters/occupation", ParametersController.createOccupation);
ParametersRouter.get("/parameters/occupations", ParametersController.getAllOccupations);
ParametersRouter.put("/parameters/occupation/:id", ParametersController.updateOccupation);
ParametersRouter.delete("/parameters/occupation/:id", ParametersController.deleteOccupation);
/* Personal Income Level */
ParametersRouter.post("/parameters/personalIncomeLevel", ParametersController.createPersonalIncomeLevel);
ParametersRouter.get("/parameters/personalIncomeLevels", ParametersController.getAllPersonalIncomeLevels);
ParametersRouter.put("/parameters/personalIncomeLevel/:id", ParametersController.updatePersonalIncomeLevel);
ParametersRouter.delete("/parameters/personalIncomeLevel/:id", ParametersController.deletePersonalIncomeLevel);
/* Family Group */
ParametersRouter.post("/parameters/familyGroup", ParametersController.createFamilyGroup);
ParametersRouter.get("/parameters/familyGroups", ParametersController.getAllFamilyGroups);
ParametersRouter.put("/parameters/familyGroup/:id", ParametersController.updateFamilyGroup);
ParametersRouter.delete("/parameters/familyGroup/:id", ParametersController.deleteFamilyGroup);
/* Family Income */
ParametersRouter.post("/parameters/familyIncome", ParametersController.createFamilyIncome);
ParametersRouter.get("/parameters/familyIncomes", ParametersController.getAllFamilyIncomes);
ParametersRouter.put("/parameters/familyIncome/:id", ParametersController.updateFamilyIncome);
ParametersRouter.delete("/parameters/familyIncome/:id", ParametersController.deleteFamilyIncome);
/* Housing Type */
ParametersRouter.post("/parameters/housingType", ParametersController.createHousingType);
ParametersRouter.get("/parameters/housingTypes", ParametersController.getAllHousingTypes);
ParametersRouter.put("/parameters/housingType/:id", ParametersController.updateHousingType);
ParametersRouter.delete("/parameters/housingType/:id", ParametersController.deleteHousingType);
/* Own Assets */
ParametersRouter.post("/parameters/ownAssets", ParametersController.createOwnAssets);
ParametersRouter.get("/parameters/ownAssets", ParametersController.getAllOwnAssets);
ParametersRouter.put("/parameters/ownAssets/:id", ParametersController.updateOwnAssets);
ParametersRouter.delete("/parameters/ownAssets/:id", ParametersController.deleteOwnAssets);
/* Receives Bonus */
ParametersRouter.post("/parameters/receivesBonus", ParametersController.createReceivesBonus);
ParametersRouter.get("/parameters/receivesBonuses", ParametersController.getAllReceivesBonuses);
ParametersRouter.put("/parameters/receivesBonus/:id", ParametersController.updateReceivesBonus);
ParametersRouter.delete("/parameters/receivesBonus/:id", ParametersController.deleteReceivesBonus);
/* Pensioner */
ParametersRouter.post("/parameters/pensioner", ParametersController.createPensioner);
ParametersRouter.get("/parameters/pensioners", ParametersController.getAllPensioners);
ParametersRouter.put("/parameters/pensioner/:id", ParametersController.updatePensioner);
ParametersRouter.delete("/parameters/pensioner/:id", ParametersController.deletePensioner);
/* Health Insurance */
ParametersRouter.post("/parameters/healthInsurance", ParametersController.createHealthInsurance);
ParametersRouter.get("/parameters/healthInsurances", ParametersController.getAllHealthInsurances);
ParametersRouter.put("/parameters/healthInsurance/:id", ParametersController.updateHealthInsurance);
ParametersRouter.delete("/parameters/healthInsurance/:id", ParametersController.deleteHealthInsurance);
/* Support Documents */
ParametersRouter.post("/parameters/supportDocuments", ParametersController.createSupportDocuments);
ParametersRouter.get("/parameters/supportDocuments", ParametersController.getAllSupportDocuments);
ParametersRouter.put("/parameters/supportDocuments/:id", ParametersController.updateSupportDocuments);
ParametersRouter.delete("/parameters/supportDocuments/:id", ParametersController.deleteSupportDocuments);
/* Vulnerability Situation */
ParametersRouter.post("/parameters/vulnerabilitySituation", ParametersController.createVulnerabilitySituation);
ParametersRouter.get("/parameters/vulnerabilitySituations", ParametersController.getAllVulnerabilitySituations);
ParametersRouter.put("/parameters/vulnerabilitySituation/:id", ParametersController.updateVulnerabilitySituation);
ParametersRouter.delete("/parameters/vulnerabilitySituation/:id", ParametersController.deleteVulnerabilitySituation);
/* Catastrophic Illness */
ParametersRouter.post("/parameters/catastrophicIllness", ParametersController.createCatastrophicIllness);
ParametersRouter.get("/parameters/catastrophicIllnesses", ParametersController.getAllCatastrophicIllnesses);
ParametersRouter.put("/parameters/catastrophicIllness/:id", ParametersController.updateCatastrophicIllness);
ParametersRouter.delete("/parameters/catastrophicIllness/:id", ParametersController.deleteCatastrophicIllness);
/* Disability */
ParametersRouter.post("/parameters/disability", ParametersController.createDisability);
ParametersRouter.get("/parameters/disabilities", ParametersController.getAllDisabilities);
ParametersRouter.put("/parameters/disability/:id", ParametersController.updateDisability);
ParametersRouter.delete("/parameters/disability/:id", ParametersController.deleteDisability);
/* Protocol */
ParametersRouter.post("/parameters/protocol", ParametersController.createProtocol);
ParametersRouter.get("/parameters/protocols", ParametersController.getAllProtocols);
ParametersRouter.put("/parameters/protocol/:id", ParametersController.updateProtocol);
ParametersRouter.delete("/parameters/protocol/:id", ParametersController.deleteProtocol);
/* Attachments */
ParametersRouter.post("/parameters/attachments", ParametersController.createAttachments);
ParametersRouter.get("/parameters/attachments", ParametersController.getAllAttachments);
ParametersRouter.put("/parameters/attachments/:id", ParametersController.updateAttachments);
ParametersRouter.delete("/parameters/attachments/:id", ParametersController.deleteAttachments);
/* AttentionType */
ParametersRouter.post("/parameters/attentionType", ParametersController.createAttentionType);
ParametersRouter.get("/parameters/attentionTypes", ParametersController.getAllAttentionTypes);
ParametersRouter.put("/parameters/attentionType/:id", ParametersController.updateAttentionType);
ParametersRouter.delete("/parameters/attentionType/:id", ParametersController.deleteAttentionType);
/* CaseStatus */
ParametersRouter.post("/parameters/caseStatus", ParametersController.createCaseStatus);
ParametersRouter.get("/parameters/caseStatuses", ParametersController.getAllCaseStatuses);
ParametersRouter.put("/parameters/caseStatus/:id", ParametersController.updateCaseStatus);
ParametersRouter.delete("/parameters/caseStatus/:id", ParametersController.deleteCaseStatus);
/* Area and Topic */
ParametersRouter.post("/parameters/areaTopic", ParametersController.createAreaTopic);
ParametersRouter.get("/parameters/areaTopics", ParametersController.getAllAreaTopics);
ParametersRouter.put("/parameters/areaTopic/:id", ParametersController.updateAreaTopic);
ParametersRouter.delete("/parameters/areaTopic/:id", ParametersController.deleteAreaTopic);

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAdminClaim = exports.createEmployee = exports.setUserRole = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
/** UID do primeiro administrador — sempre tem acesso total ao painel e às funções de admin. */
const SUPER_ADMIN_UID = 'ihiEK5NmBhdCdgAoH8U22eFwPwZ2';
function isAdmin(callerUid, callerRole) {
    return callerUid === SUPER_ADMIN_UID || callerRole === 'admin' || callerRole === 'administrador';
}
exports.setUserRole = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Faça login.');
    const callerUid = context.auth.uid;
    const callerRecord = await admin.auth().getUser(callerUid);
    const callerRole = callerRecord.customClaims?.role;
    if (!isAdmin(callerUid, callerRole))
        throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem alterar perfis.');
    const { targetUserId, role } = data ?? {};
    if (!targetUserId || !role)
        throw new functions.https.HttpsError('invalid-argument', 'Informe o usuário e o perfil.');
    const validRoles = ['administrador', 'admin', 'comercial', 'vendedor', 'usuario', 'user'];
    const normalizedRole = role === 'Vendedor' || role === 'vendedor' ? 'comercial' : role === 'Usuário' || role === 'usuário' || role === 'usuario' ? 'usuario' : role === 'Administrador' || role === 'administrador' ? 'administrador' : role;
    if (!validRoles.includes(normalizedRole))
        throw new functions.https.HttpsError('invalid-argument', 'Perfil inválido.');
    await admin.auth().setCustomUserClaims(targetUserId, { role: normalizedRole });
    const db = admin.firestore();
    await db.collection('users').doc(targetUserId).set({ role: normalizedRole, updatedAt: admin.firestore.FieldValue.serverTimestamp(), updatedBy: callerUid }, { merge: true });
    return { success: true };
});
/** Cria um novo usuário (funcionário) com e-mail/senha e perfil. Apenas admin. */
exports.createEmployee = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Faça login.');
    const callerUid = context.auth.uid;
    const callerRecord = await admin.auth().getUser(callerUid);
    const callerRole = callerRecord.customClaims?.role;
    if (!isAdmin(callerUid, callerRole))
        throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem cadastrar funcionários.');
    const { email, password, displayName, role } = data ?? {};
    if (!email || !password || password.length < 6)
        throw new functions.https.HttpsError('invalid-argument', 'E-mail e senha (mín. 6 caracteres) são obrigatórios.');
    const normalizedRole = role === 'Vendedor' || role === 'vendedor' ? 'comercial'
        : role === 'Usuário' || role === 'usuário' || role === 'usuario' ? 'usuario'
            : role === 'Administrador' || role === 'administrador' ? 'administrador'
                : role;
    const validRoles = ['administrador', 'admin', 'comercial', 'usuario'];
    if (!validRoles.includes(normalizedRole))
        throw new functions.https.HttpsError('invalid-argument', 'Perfil inválido. Use: Administrador, Vendedor ou Usuário.');
    const userRecord = await admin.auth().createUser({
        email: email.trim(),
        password: password.trim(),
        displayName: (displayName || email).trim(),
    });
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: normalizedRole });
    const db = admin.firestore();
    await db.collection('users').doc(userRecord.uid).set({
        email: userRecord.email,
        displayName: userRecord.displayName || displayName || email,
        role: normalizedRole,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: callerUid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return {
        success: true,
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || displayName,
        role: normalizedRole,
    };
});
/** Permite ao primeiro admin (UID fixo) atribuir a si mesmo a role administrador uma vez. */
exports.ensureAdminClaim = functions.https.onCall(async (_data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Faça login.');
    const uid = context.auth.uid;
    if (uid !== SUPER_ADMIN_UID)
        throw new functions.https.HttpsError('permission-denied', 'Não permitido.');
    const user = await admin.auth().getUser(uid);
    const existing = user.customClaims?.role;
    if (existing === 'admin' || existing === 'administrador')
        return { success: true, role: existing };
    await admin.auth().setCustomUserClaims(uid, { role: 'administrador' });
    const db = admin.firestore();
    await db.collection('users').doc(uid).set({ role: 'administrador', updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    return { success: true, role: 'administrador' };
});
//# sourceMappingURL=callable.js.map
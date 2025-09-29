/**
 * Basic policy configuration to be used in the API
 * ! NOT CURRENTLY IN USE
 */

function canViewUsers(user) {
  return user.role === 'COORDINATOR';
}

function canViewOwnProfile(user, targetUserId) {
  return user.id === targetUserId || user.sub === targetUserId;
}

function canManageLegalDocs(user) {
  return user.role === 'LEGAL' || user.role === 'COORDINATOR';
}

module.exports = { canViewUsers, canViewOwnProfile, canManageLegalDocs };

export const getAccounts = (state) => state.accounts.bag;
export const getAccountName = (state, accountId) => state.accounts.bag[accountId].name;
export const getAccountAvatar = (state, accountId) => state.accounts.bag[accountId].avatar;

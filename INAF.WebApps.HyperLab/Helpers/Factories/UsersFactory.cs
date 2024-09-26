using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.Libraries.Net.CommonWebAppModels.Models.Users;
using INAF.Libraries.Net.HyperLabCommonModels.Values;

namespace INAF.WebApps.HyperLab.Helpers.Factories
{
    public sealed class UsersFactory
    {
        private readonly DbHandlerHyperLabUsers dbHandlerHyperLabUsers;

        public UsersFactory(DbHandlerHyperLabUsers dbHandlerHyperLabUsers)
        {
            this.dbHandlerHyperLabUsers = dbHandlerHyperLabUsers;
        }

        public UserModel createUserForInsert()
        {
            List<ContactModel> contacts = new List<ContactModel>
            {
                new ContactModel()
                {
                    ContactType = Enums.ContactType.Email
                }
            };
            return new UserModel()
            {
                Contacts = contacts,
                Roles = dbHandlerHyperLabUsers.getRoles(),
                OperationType = Libraries.Net.CommonWebAppModels.Values.Enums.OperationType.Insert
            };
        }

        public UserModel getUserForUpdate(int userId)
        {
            var userDetails = dbHandlerHyperLabUsers.getUserDetails(userId);
            return new UserModel()
            {
                Id = userId,
                Name = userDetails.Name,
                LastName = userDetails.LastName,
                Contacts = userDetails.Contacts,
                Roles = dbHandlerHyperLabUsers.getRoles(),
                RoleId = userDetails.Roles[0].Id,
                Login = dbHandlerHyperLabUsers.getLogin(userId),
                OperationType = Libraries.Net.CommonWebAppModels.Values.Enums.OperationType.Update
            };
        }
    }
}

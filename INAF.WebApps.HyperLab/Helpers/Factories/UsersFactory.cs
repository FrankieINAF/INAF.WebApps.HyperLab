using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.Libraries.Net.CommonWebAppModels.Models.Users;
using INAF.Libraries.Net.HyperLab.CommonModels.Values;
using static INAF.Libraries.Net.CommonWebAppModels.Values.Enums;

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
                    ContactType = ContactType.Email
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
            var userDetails = dbHandlerHyperLabUsers.getUserDetails(userId,
                                                                    Enums.CallerContext.Web);
            return new UserModel()
            {
                Id = userId,
                Name = userDetails.Name,
                LastName = userDetails.LastName,
                Contacts = userDetails.Contacts,
                Roles = dbHandlerHyperLabUsers.getRoles(),
                RoleId = userDetails.Roles[0].Id,
                Login = dbHandlerHyperLabUsers.getLoginFromUserId(userId),
                OperationType = Libraries.Net.CommonWebAppModels.Values.Enums.OperationType.Update
            };
        }
    }
}

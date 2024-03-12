using INAF.Libraries.Net.CommonWebAppModels.Models.Users;
using INAF.Libraries.Net.SLabDbLibrary;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Values;

namespace INAF.WebApps.HyperLab.Helpers.Factories
{
    public sealed class UsersFactory
    {
        private readonly DbHandler dbHandler;

        public UsersFactory(DbHandler dbHandler)
        {
            this.dbHandler = dbHandler;
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
                Roles = dbHandler.getRoles(),
                OperationType = Libraries.Net.CommonWebAppModels.Values.Enums.OperationType.Insert
            };
        }

        public UserModel getUserForUpdate(int userId)
        {
            var userDetails = dbHandler.getUserDetails(userId);
            return new UserModel()
            {
                Id = userId,
                Name = userDetails.Name,
                LastName = userDetails.LastName,
                Contacts = userDetails.Contacts,
                Roles = dbHandler.getRoles(),
                RoleId = userDetails.Roles[0].Id,
                Login = dbHandler.getLogin(userId),
                OperationType = Libraries.Net.CommonWebAppModels.Values.Enums.OperationType.Update
            };
        }
    }
}

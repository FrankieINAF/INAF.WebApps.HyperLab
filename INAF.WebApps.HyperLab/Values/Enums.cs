namespace INAF.WebApps.HyperLab.Values
{
    public sealed class Enums
    {
        public enum Caller
        {
            App = 0,
            WebApp
        }

        public enum ControllerOperationStatus
        {
            None = -1,
            Ok = 0,
            ModelInvalid = 2,
            UpsertError = 3
        }

        public enum Permissions
        {
            Menu = 2,
            UsersManagement = 3,
            UpsertUser = 4,
            RemoveUser = 5,
            SaveOnCloud = 6,
            SaveOnCloudFromWeb = 7,
            SaveOnCloudFromApp = 8,
            Search = 9,
            SaveChart = 10,
            SaveDataAsFile = 11,
            SaveChartAsFile = 12,
            ResetPassword = 13,
            UsersList = 14,
        }
    }
}

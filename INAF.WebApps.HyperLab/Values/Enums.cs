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
            SaveOnCloudFromWeb = 7,
            SaveOnCloudFromApp = 8,
            Searches = 9,
            SaveChart = 10,
            SaveDataAsFile = 11,
            SaveChartAsFile = 12,
            ResetPassword = 13,
            UsersList = 14,
            Database = 15,
            UpsertMinerals = 16,
            SLabManager = 17,
            Stats = 18,
            GMode = 19,
            KMeans = 20,
            QubesAnalysis = 21,
        }
    }
}

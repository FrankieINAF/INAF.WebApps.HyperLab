namespace INAF.WebApps.HyperLab.Models
{
    public class AppPageModel
    {
        public AppPageModel(string appName,
                            string pageTitle,
                            List<string> descriptions,
                            string? acknowledgments = null) 
        {
            AppName = appName;
            PageTitle = pageTitle;
            Descriptions = descriptions;
            Acknowledgments = acknowledgments;
        }

        public string? Acknowledgments { get; private set; }

        public string AppName { get; private set; }

        public string PageTitle { get; private set; }

        public List<string> Descriptions { get; private set; }
    }
}

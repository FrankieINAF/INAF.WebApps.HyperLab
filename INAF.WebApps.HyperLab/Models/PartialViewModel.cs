namespace INAF.WebApps.HyperLab.Models
{
    public class PartialViewModel
    {
        public PartialViewModel(bool isUserAuthorized) 
        {
            IsUserAuthenticated = isUserAuthorized;
        }

        public bool IsUserAuthenticated { get; private set; }
    }
}

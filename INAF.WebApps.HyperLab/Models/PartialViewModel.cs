namespace INAF.WebApps.HyperLab.Models
{
    public class PartialViewModel
    {
        public PartialViewModel(bool isUserAuthenticated) 
        {
            IsUserAuthenticated = isUserAuthenticated;
        }

        public bool IsUserAuthenticated { get; private set; }
    }
}

using static INAF.Libraries.Net.HyperLab.CommonModels.Values.Enums;

namespace INAF.WebApps.HyperLab.Models
{
    public sealed class SessionSearchModel
    {
        public object? SearchObjectJson { get; set; }

        public SearchType SearchType { get; set; }
    }
}

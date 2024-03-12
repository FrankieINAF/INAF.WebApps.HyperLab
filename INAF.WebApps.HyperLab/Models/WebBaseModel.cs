using static INAF.WebApps.HyperLab.Values.Enums;

namespace INAF.WebApps.HyperLab.Models
{
    public class WebBaseModel
    {
        public int Id { get; set; }

        public ControllerOperationStatus ControllerOperationStatus { get; set; } = ControllerOperationStatus.None;

        public string? ControllerOperationMessage { get; set; }
    }
}

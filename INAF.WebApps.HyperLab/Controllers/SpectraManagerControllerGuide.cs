using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    public partial class SpectraManagerController
    {
        [HttpGet]
        public IActionResult GuideSpectraHubChart()
        {
            return PartialView("Partials/Guide/_SpectraHubChart");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubChartMenu()
        {
            return PartialView("Partials/Guide/_SpectraHubChartMenu");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubChartMagicWand()
        {
            return PartialView("Partials/Guide/_SpectraHubChartMagicWand");
        }

        #region PANELS
        [HttpGet]
        public IActionResult GuideSpectraHubChartPanelsAlignmentPanel()
        {
            return PartialView("Partials/Guide/Panels/_AlignmentPanel");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubChartPanelsContinuumRemovalPanel()
        {
            return PartialView("Partials/Guide/Panels/_ContinuumRemovalPanel");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubChartPanelsContinuumRemovalPanelCoreModeGif()
        {
            return PartialView("Partials/Guide/Panels/_ContinuumRemovalPanelCoreModeGif");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubChartPanelsContinuumRemovalPanelProModeGif()
        {
            return PartialView("Partials/Guide/Panels/_ContinuumRemovalPanelProModeGif");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubChartPanelsSmoothingPanel()
        {
            return PartialView("Partials/Guide/Panels/_SmoothingPanel");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubChartPanelsBandAnalysisPanel()
        {
            return PartialView("Partials/Guide/Panels/_BandAnalysisPanel");
        }
        #endregion
    }
}

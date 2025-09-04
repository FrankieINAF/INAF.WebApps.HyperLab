using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    public partial class SpectraManagerController
    {
        #region HUB
        [HttpGet]
        public IActionResult GuideSpectraHub()
        {
            return PartialView("Partials/Guide/_SpectraHub");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubComplexSearch()
        {
            return PartialView("Partials/Guide/_SpectraHubComplexSearch");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubLoadLocalFiles()
        {
            return PartialView("Partials/Guide/_SpectraHubLoadLocalFiles");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubMenu()
        {
            return PartialView("Partials/Guide/_SpectraHubMenu");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubSearchResults()
        {
            return PartialView("Partials/Guide/_SpectraHubSearchResults");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubSimpleSearch()
        {
            return PartialView("Partials/Guide/_SpectraHubSimpleSearch");
        }
        #endregion

        #region CHART
        [HttpGet]
        public IActionResult GuideSpectraHubChart()
        {
            return PartialView("Partials/Guide/_SpectraHubChart");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubChartColorPicker()
        {
            return PartialView("Partials/Guide/_SpectraHubChartColorPicker");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubChartLegend()
        {
            return PartialView("Partials/Guide/_SpectraHubChartLegend");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubChartMagicWand()
        {
            return PartialView("Partials/Guide/_SpectraHubChartMagicWand");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubChartMenu()
        {
            return PartialView("Partials/Guide/_SpectraHubChartMenu");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubChartMessages()
        {
            return PartialView("Partials/Guide/_SpectraHubChartMessages");
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
        #endregion
    }
}

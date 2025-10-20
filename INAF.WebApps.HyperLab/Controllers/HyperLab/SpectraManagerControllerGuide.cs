using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers.HyperLab
{
    public partial class SpectraManagerController
    {
        #region HUB
        [HttpGet]
        public IActionResult GuideSpectraHub()
        {
            return PartialView("~/Views/HyperLab/SpectraManager/Partials/Guide/_SpectraHub.cshtml");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubComplexSearch()
        {
            return PartialView("~/Views/HyperLab/SpectraManager/Partials/Guide/_SpectraHubComplexSearch.cshtml");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubLoadLocalFiles()
        {
            return PartialView("~/Views/HyperLab/SpectraManager/Partials/Guide/_SpectraHubLoadLocalFiles.cshtml");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubMenu()
        {
            return PartialView("~/Views/HyperLab/SpectraManager/Partials/Guide/_SpectraHubMenu.cshtml");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubSearchResults()
        {
            return PartialView("~/Views/HyperLab/SpectraManager/Partials/Guide/_SpectraHubSearchResults.cshtml");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubSimpleSearch()
        {
            return PartialView("~/Views/HyperLab/SpectraManager/Partials/Guide/_SpectraHubSimpleSearch.cshtml");
        }
        #endregion

        #region CHART
        [HttpGet]
        public IActionResult GuideSpectraHubChart()
        {
            return PartialView("~/Views/HyperLab/SpectraManager/Partials/Guide/_SpectraHubChart.cshtml");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubChartColorPicker()
        {
            return PartialView("~/Views/HyperLab/SpectraManager/Partials/Guide/_SpectraHubChartColorPicker.cshtml");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubChartLegend()
        {
            return PartialView("~/Views/HyperLab/SpectraManager/Partials/Guide/_SpectraHubChartLegend.cshtml");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubChartMagicWand()
        {
            return PartialView("~/Views/HyperLab/SpectraManager/Partials/Guide/_SpectraHubChartMagicWand.cshtml");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubChartMenu()
        {
            return PartialView("~/Views/HyperLab/SpectraManager/Partials/Guide/_SpectraHubChartMenu.cshtml");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubChartMessages()
        {
            return PartialView("~/Views/HyperLab/SpectraManager/Partials/Guide/_SpectraHubChartMessages.cshtml");
        }

        #region PANELS
        [HttpGet]
        public IActionResult GuideSpectraHubChartPanelsAlignmentPanel()
        {
            return PartialView("~/Views/HyperLab/SpectraManager/Partials/Guide/Panels/_AlignmentPanel.cshtml");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubChartPanelsContinuumRemovalPanel()
        {
            return PartialView("~/Views/HyperLab/SpectraManager/Partials/Guide/Panels/_ContinuumRemovalPanel.cshtml");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubChartPanelsContinuumRemovalPanelCoreModeGif()
        {
            return PartialView("~/Views/HyperLab/SpectraManager/Partials/Guide/Panels/_ContinuumRemovalPanelCoreModeGif.cshtml");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubChartPanelsContinuumRemovalPanelProModeGif()
        {
            return PartialView("~/Views/HyperLab/SpectraManager/Partials/Guide/Panels/_ContinuumRemovalPanelProModeGif.cshtml");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubChartPanelsSmoothingPanel()
        {
            return PartialView("~/Views/HyperLab/SpectraManager/Partials/Guide/Panels/_SmoothingPanel.cshtml");
        }

        [HttpGet]
        public IActionResult GuideSpectraHubChartPanelsBandAnalysisPanel()
        {
            return PartialView("~/Views/HyperLab/SpectraManager/Partials/Guide/Panels/_BandAnalysisPanel.cshtml");
        }
        #endregion
        #endregion
    }
}

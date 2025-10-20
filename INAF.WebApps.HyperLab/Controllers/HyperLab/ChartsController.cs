using INAF.Libraries.Net.CommonWebAppModels.Models.Permissions;
using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Spectrum;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Requests;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Helpers;
using INAF.WebApps.HyperLab.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers.HyperLab
{
    public class ChartsController : BaseController
    {
        private readonly DbHandlerHyperLabData dbHandlerHyperLabData;

        public ChartsController(IServiceProvider serviceProvider, 
                                ILogger<ChartsController> logger,
                                DbHandlerHyperLabData dbHandlerHyperLabData) : base(serviceProvider, logger)
        {
            this.dbHandlerHyperLabData = dbHandlerHyperLabData;
        }

        [HttpGet]
        public IActionResult LoadAlignmentPanel()
        {
            (bool isUserAuthenticated, List<PermissionModel>? permissions) userStatus = getUserStatus();

            PartialViewModel partialViewModel = new PartialViewModel(userStatus.isUserAuthenticated);
            return PartialView("~/Views/HyperLab/Charts/Partials/_AlignmentPanel.cshtml", partialViewModel);
        }

        [HttpGet]
        public IActionResult LoadChartError()
        {
            return PartialView("~/Views/HyperLab/Charts/Partials/_ChartError.cshtml");
        }

        [HttpGet]
        public IActionResult LoadFitPanel()
        {
            (bool isUserAuthenticated, List<PermissionModel>? permissions) userStatus = getUserStatus();
            PartialViewModel partialViewModel = new PartialViewModel(userStatus.isUserAuthenticated);

            return PartialView("~/Views/HyperLab/Charts/Partials/_FitPanel.cshtml", partialViewModel);
        }

        [HttpGet]
        public IActionResult LoadSmoothingPanel()
        {
            (bool isUserAuthenticated, List<PermissionModel>? permissions) userStatus = getUserStatus();
            PartialViewModel partialViewModel = new PartialViewModel(userStatus.isUserAuthenticated);

            return PartialView("~/Views/HyperLab/Charts/Partials/_SmoothingPanel.cshtml", partialViewModel);
        }

        #region GET
        [HttpGet]
        public IActionResult GetWhiteSpectraForAlignment()
        {
            List<int>? ids = dbHandlerHyperLabData.getWhiteSpectraForAlignmentIds();

            if (ids == null || ids.Count == 0)
                return new JsonResult(null);

            var chartsHelper = serviceProvider.GetRequiredService<ChartsHelper>();
            return new JsonResult(chartsHelper.createRefWhitesJson(ids, 0)); // operationUserId = 0 for 'white' spectra available for everyone (not related to a specific insertUserId)
        }
        #endregion

        #region POST
        [Authorize]
        [CheckIsLoginValid]
        [HttpPost]
        public IActionResult GetSpectra([FromBody] GenericRequestByIdsModel model)
        {
            if (model.Ids == null || model.Ids.Count == 0)
                return new JsonResult(null);

            switch (getCallerContext())
            {
                case Libraries.Net.HyperLab.CommonModels.Values.Enums.CallerContext.Web:
                    var chartsHelper = serviceProvider.GetRequiredService<ChartsHelper>();
                    List<ISpectrumModel> spectraModels = dbHandlerHyperLabData.getSpectraByIdProcedure(model.Ids,
                                                                                                       getUserId());
                    if (spectraModels == null || spectraModels.Count == 0)
                        return new EmptyResult();
                    return new JsonResult(chartsHelper.createMultipleSpectraJson(spectraModels, getUserId()));

                case Libraries.Net.HyperLab.CommonModels.Values.Enums.CallerContext.App:
                    var spectra = dbHandlerHyperLabData.getSpectraByIdProcedure(model.Ids, getUserId());
                    if (spectra != null && spectra.Count > 0)
                        return new JsonResult(spectra);
                    return new EmptyResult();
            }

            return new EmptyResult();
        }

        [Authorize]
        [CheckIsLoginValid]
        [HttpPost]
        public IActionResult GetProcessedSpectrum([FromBody] GenericRequestByParentIdAndSpectrumTypeModel model)
        {
            var chartsHelper = serviceProvider.GetRequiredService<ChartsHelper>();
            return new JsonResult(chartsHelper.createSingleSpectrumJson(model.ParentId, model.SpectrumType, getUserId()));
        }
        #endregion
    }
}

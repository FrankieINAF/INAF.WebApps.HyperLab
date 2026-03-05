using INAF.Libraries.Net.CommonWebAppModels.Models.Permissions;
using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.Extensions;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Spectrum;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Requests;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Helpers;
using INAF.WebApps.HyperLab.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static INAF.Libraries.Net.HyperLab.CommonModels.Values.Enums;

namespace INAF.WebApps.HyperLab.Controllers
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
        public async Task<IActionResult> LoadAlignmentPanel()
        {
            (bool isUserAuthenticated, List<PermissionModel>? permissions) userStatus = await getUserStatusAsync();

            PartialViewModel partialViewModel = new PartialViewModel(userStatus.isUserAuthenticated);
            return PartialView("Partials/_AlignmentPanel", partialViewModel);
        }

        [HttpGet]
        public IActionResult LoadChartError()
        {
            return PartialView("Partials/_ChartError");
        }

        [HttpGet]
        public async Task<IActionResult> LoadFitPanel()
        {
            (bool isUserAuthenticated, List<PermissionModel>? permissions) userStatus = await getUserStatusAsync();
            PartialViewModel partialViewModel = new PartialViewModel(userStatus.isUserAuthenticated);

            return PartialView("Partials/_FitPanel", partialViewModel);
        }

        [HttpGet]
        public async Task<IActionResult> LoadSmoothingPanel()
        {
            (bool isUserAuthenticated, List<PermissionModel>? permissions) userStatus = await getUserStatusAsync();
            PartialViewModel partialViewModel = new PartialViewModel(userStatus.isUserAuthenticated);

            return PartialView("Partials/_SmoothingPanel", partialViewModel);
        }

        #region GET
        [Authorize]
        [CheckIsLoginValid]
        [HttpGet]
        public async Task<IActionResult> GetProcessedSpectrumById(GenericRequestByIdModel model)
        {
            var chartsHelper = serviceProvider.GetRequiredService<ChartsHelper>();

            ISpectrumModel? spectrumModel = dbHandlerHyperLabData.getSpectrumById(model.Id,
                                                                                  await getUserIdAsync());
            if (spectrumModel == null || !spectrumModel.Points.IsAny())
                return new JsonResult(null);

            return new JsonResult(chartsHelper.createSingleSpectrumJson(spectrumModel));
        }

        [Authorize]
        [CheckIsLoginValid]
        [HttpGet]
        public async Task<IActionResult> GetProcessedSpectrumByParentId(GenericRequestByParentIdAndSpectrumTypeModel model)
        {
            var chartsHelper = serviceProvider.GetRequiredService<ChartsHelper>();

            ISpectrumModel? spectrumModel = dbHandlerHyperLabData.getSpectrumByParentIdAndSpectrumType(model.ParentId,
                                                                                                       model.SpectrumType,
                                                                                                       await getUserIdAsync());
            if (spectrumModel == null || !spectrumModel.Points.IsAny())
                return new JsonResult(null);

            return new JsonResult(chartsHelper.createSingleSpectrumJson(spectrumModel));
        }

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
        public async Task<IActionResult> GetSpectra([FromBody] GenericRequestByIdsModel model)
        {
            if (model.Ids == null || model.Ids.Count == 0)
                return new JsonResult(null);

            int operationUserId = await getUserIdAsync();
            switch (getCallerContext())
            {
                case CallerContext.Web:
                    var chartsHelper = serviceProvider.GetRequiredService<ChartsHelper>();
                    List<ISpectrumModel> spectraModels = dbHandlerHyperLabData.getSpectraByIdProcedure(model.Ids,
                                                                                                       operationUserId);
                    if (spectraModels == null || spectraModels.Count == 0)
                        return new EmptyResult();
                    return new JsonResult(chartsHelper.createMultipleSpectraJson(spectraModels, operationUserId));

                case CallerContext.App:
                    var spectra = dbHandlerHyperLabData.getSpectraByIdProcedure(model.Ids, operationUserId);
                    if (spectra != null && spectra.Count > 0)
                        return new JsonResult(spectra);
                    return new EmptyResult();
            }

            return new EmptyResult();
        }

        [Authorize]
        [CheckIsLoginValid]
        [HttpPost]
        public async Task<IActionResult> GetProcessedSpectrum([FromBody] GenericRequestByParentIdAndSpectrumTypeModel model)
        {
            var chartsHelper = serviceProvider.GetRequiredService<ChartsHelper>();

            ISpectrumModel? spectrumModel = dbHandlerHyperLabData.getSpectrumByParentIdAndSpectrumType(model.ParentId, 
                                                                                                       model.SpectrumType, 
                                                                                                       await getUserIdAsync());
            if (spectrumModel == null || !spectrumModel.Points.IsAny())
                return new JsonResult(null);

            return new JsonResult(chartsHelper.createSingleSpectrumJson(spectrumModel));
        }
        #endregion
    }
}

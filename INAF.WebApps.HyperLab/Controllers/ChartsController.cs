using INAF.Libraries.Net.CommonWebAppHelpers;
using INAF.Libraries.Net.CommonWebAppModels.Models.Permissions;
using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.Extensions;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Pages;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Searches;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Requests;
using INAF.Libraries.Net.ScienceModels.Spectra.Interfaces;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Helpers;
using INAF.WebApps.HyperLab.Models;
using INAF.WebApps.HyperLab.Values;
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

        #region VIEWS
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Chart([FromForm] NavigateToChartModel model)
        {
            HttpContext.Session.SetString(Constants.LAST_PAGE, nameof(Chart));
            (bool isUserAuthenticated, List<PermissionModel>? permissions) status = await getUserStatusAsync();

            IEnumerable<int>? Ids = model.SelectedSpectra ?? Array.Empty<int>();
            SelectedSpectraModel? selectedSpectra = null;
            if (model.SelectedSpectra != null && model.SelectedSpectra.Length > 0)
            {
                selectedSpectra = new SelectedSpectraModel() { Ids = Ids };
            }

            ChartPageModel chartPageModel = new ChartPageModel(status.isUserAuthenticated, status.permissions, selectedSpectra);

            return View(chartPageModel);
        }

        #region PARTIAL VIEWS
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
        #endregion
        #endregion

        #region GET
        [Authorize]
        [IsLoginValid]
        [HttpGet]
        public async Task<IActionResult> GetProcessedSpectrumById(GenericRequestByIdModel model)
        {
            var chartsHelper = serviceProvider.GetRequiredService<ChartsHelper>();

            ISpectrumModel? spectrumModel = dbHandlerHyperLabData.getSpectrumById(model.Id,
                                                                                  isPublicSearch(),
                                                                                  await getUserIdAsync());
            if (spectrumModel == null || !spectrumModel.Points.IsAny())
                return new JsonResult(null);

            return new JsonResult(chartsHelper.createSingleSpectrumJson(spectrumModel));
        }

        [Authorize]
        [IsLoginValid]
        [HttpGet]
        public async Task<IActionResult> GetProcessedSpectrumByParentId(GenericRequestByParentIdAndSpectrumTypeModel model)
        {
            var chartsHelper = serviceProvider.GetRequiredService<ChartsHelper>();

            ISpectrumModel? spectrumModel = dbHandlerHyperLabData.getSpectrumByParentIdAndSpectrumType(model.ParentId,
                                                                                                       model.SpectrumType,
                                                                                                       isPublicSearch(),
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
        [HttpPost]
        public async Task<IActionResult> GetSpectra([FromBody] GenericRequestByIdsModel model)
        {
            if (model.Ids == null || model.Ids.Count == 0)
                return new JsonResult(null);

            /* the following check replace [Authorize] and [IsLoginValid] attributes because this method can be called by both logged users or users using public stuff */
            if (!isAuthorizedSearch() && !dbHandlerHyperLabData.isPublicSpectra(model.Ids))
                return RedirectToAction(nameof(AccountController.Login), GenericHelper.GetControllerName(nameof(AccountController)));

            int operationUserId = await getUserIdAsync();
            List<ISpectrumModel> spectra = dbHandlerHyperLabData.getSpectraByIdProcedure(model.Ids,
                                                                                         isPublicSearch(),
                                                                                         operationUserId);
            //foreach (var spectrum in spectra)
            //{
            //    logger.LogInformation($"found spectrum: {spectrum.Id} with num of points: {spectrum.Points?.Count}");
            //}
            if (spectra == null || spectra.Count == 0)
                return new EmptyResult();

            switch (getCallerContext())
            {
                case CallerContext.Web:
                    var chartsHelper = serviceProvider.GetRequiredService<ChartsHelper>();
                    return new JsonResult(chartsHelper.createMultipleSpectraJson(spectra, operationUserId));

                case CallerContext.App:
                    return new JsonResult(spectra);
            }

            return new EmptyResult();
        }

        [Authorize]
        [IsLoginValid]
        [HttpPost]
        public async Task<IActionResult> GetProcessedSpectrum([FromBody] GenericRequestByParentIdAndSpectrumTypeModel model)
        {
            var chartsHelper = serviceProvider.GetRequiredService<ChartsHelper>();

            ISpectrumModel? spectrumModel = dbHandlerHyperLabData.getSpectrumByParentIdAndSpectrumType(model.ParentId,
                                                                                                       model.SpectrumType,
                                                                                                       isPublicSearch(),
                                                                                                       await getUserIdAsync());
            if (spectrumModel == null || !spectrumModel.Points.IsAny())
                return new JsonResult(null);

            return new JsonResult(chartsHelper.createSingleSpectrumJson(spectrumModel));
        }
        #endregion
    }
}

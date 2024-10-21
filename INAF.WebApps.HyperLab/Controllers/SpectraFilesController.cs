using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.HyperLabCommonModels.Models.Spectrum;
using INAF.Libraries.Net.HyperLabCommonModels.Models.Spectrum.BandAnalysis;
using INAF.Libraries.Net.HyperLabCommonModels.Models.Spectrum.ProcessedSpectraInfo.Alignment;
using INAF.Libraries.Net.HyperLabCommonModels.Models.Spectrum.ProcessedSpectraInfo.ContinuumRemoval;
using INAF.Libraries.Net.HyperLabCommonModels.Models.WebApp.Requests;
using INAF.Libraries.Net.HyperLabCommonModels.Models.WebApp.Responses;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    [Authorize]
    [CheckIsLoginValid]
    public class SpectraFilesController : BaseController
    {
        private readonly DbHandlerHyperLabUsers dbHandlerHyperLabUsers;
        private readonly DbHandlerHyperLabData dbHandlerSLabData;

        public SpectraFilesController(IServiceProvider serviceProvider,
                                      ILogger<SpectraFilesController> logger,
                                      DbHandlerHyperLabUsers dbHandlerHyperLabUsers,
                                      DbHandlerHyperLabData dbHandlerSLabData) : base(serviceProvider, logger)
        {
            this.dbHandlerHyperLabUsers = dbHandlerHyperLabUsers;
            this.dbHandlerSLabData = dbHandlerSLabData;
        }

        [HttpGet]
        public IActionResult GetAlignmentSettings(GenericRequestByIdModel model)
        {
            AlignmentSettingsModel? alignmentSettingsModel = dbHandlerSLabData.getAlignmentSettings(model.Id,
                                                                                                   getUserId());
            if (alignmentSettingsModel != null)
                return new JsonResult(new GenericResponseModel(alignmentSettingsModel));
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }

        [HttpGet]
        public IActionResult GetContinuumRemovalSettings(GenericRequestByIdModel model)
        {
            ContinuumRemovalSettingsModel? continuumRemovalSettingsModel = dbHandlerSLabData.getContinuumRemovalSettings(model.Id,
                                                                                                                         getUserId());
            if (continuumRemovalSettingsModel != null)
                return new JsonResult(new GenericResponseModel(continuumRemovalSettingsModel));
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }

        [HttpGet]
        public IActionResult GetSpectrumByParentIdAndSpectrumType(GenericRequestByParentIdAndSpectrumTypeModel model)
        {
            ISpectrumModel? spectrumModel = dbHandlerSLabData.getSpectrumByParentIdAndSpectrumType(model.ParentId,
                                                                                                   model.SpectrumType,
                                                                                                   getUserId());
            if (spectrumModel != null)
                return new JsonResult(new GenericResponseModel(spectrumModel));
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }

        [HttpGet]
        public IActionResult GetSpectrumIdByParentIdAndSpectrumType(IdAndSpectrumTypeRequestModel model)
        {
            int id = dbHandlerSLabData.getSpectrumIdByParentIdAndSpectrumType(model.Id,
                                                                              model.SpectrumType,
                                                                              getUserId());
            if (id != int.MinValue)
                return new JsonResult(new GenericResponseModel() { IsOk = true, Id = id });
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }

        [HttpGet]
        public IActionResult GetSpectrumFilename(GenericRequestByIdModel model)
        {
            SpectrumModel? spectrumModel = dbHandlerSLabData.getSpectrumFilename(model.Id,
                                                                                 getUserId());

            return new JsonResult(spectrumModel);
        }

        #region BAND ANALYSIS
        [HttpGet]
        public IActionResult GetBandAnalysisData(BandAnalysisModel model)
        {
            var bandAnalysisModel = dbHandlerSLabData.getBandAnalysisData(model.Id,
                                                                          getUserId());
            if (bandAnalysisModel != null)
                return new JsonResult(new GenericResponseModel() { IsOk = true, ResponseObject = bandAnalysisModel });
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }

        [HttpGet]
        public IActionResult GetBandsAnalysisData(BandAnalysisModel model)
        {
            var bandsAnalysisModel = dbHandlerSLabData.getBandsAnalysisData(model.FileId,
                                                                            getUserId());
            if (bandsAnalysisModel != null)
                return new JsonResult(new GenericResponseModel() { IsOk = true, ResponseObject = bandsAnalysisModel });
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }

        [HttpPost]
        public IActionResult IsBandOverlappingWithExistingOne([FromBody] BandAnalysisModel model)
        {
            int bandOverlapRange = dbHandlerHyperLabUsers.getUserSettingsBandOverlapRange(getUserId());

            bool isOverlapping = dbHandlerSLabData.isBandOverlappingWithExistingOne(model.FileId,
                                                                                    model.LeftBoundary,
                                                                                    model.RightBoundary,
                                                                                    bandOverlapRange,
                                                                                    getUserId());
            return new JsonResult(new GenericResponseModel() { BoolValue = isOverlapping });
        }

        [HttpPost]
        public async Task<IActionResult> SaveBandAnalysisData([FromBody] BandAnalysisModel model)
        {
            (bool isOk, int id) result = await dbHandlerSLabData.upsertBandAnalysisDataAsync(model.FileId,
                                                                                             model.Id,
                                                                                             model.LeftBoundary,
                                                                                             model.RightBoundary,
                                                                                             model.BandCenterX,
                                                                                             model.BandDepth,
                                                                                             model.BandArea,
                                                                                             model.FwhmLeftMargin,
                                                                                             model.FwhmRightMargin,
                                                                                             getUserId());
            if (result.isOk)
                return new JsonResult(new GenericResponseModel() { Id = result.id, IsOk = true });
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }
        #endregion
    }
}

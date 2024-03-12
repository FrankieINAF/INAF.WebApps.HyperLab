using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.SLabDbLibrary;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.Spectrum;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.Spectrum.BandAnalysis;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.Spectrum.ProcessedSpectraInfo.Alignment;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.Spectrum.ProcessedSpectraInfo.ContinuumRemoval;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.WebApp.Requests;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.WebApp.Responses;
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
        public SpectraFilesController(IServiceProvider serviceProvider,
                                      DbHandler dbHandler,
                                      ILogger<BaseController> logger) : base(serviceProvider, dbHandler, logger)
        { }

        [HttpGet]
        public IActionResult GetAlignmentSettings(GenericRequestByIdModel model)
        {
            AlignmentSettingsModel alignmentSettingsModel = dbHandler.getAlignmentSettings(model.Id,
                                                                                           getUserId());
            if (alignmentSettingsModel != null)
                return new JsonResult(new GenericResponseModel(alignmentSettingsModel));
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }

        [HttpGet]
        public IActionResult GetContinuumRemovalSettings(GenericRequestByIdModel model)
        {
            ContinuumRemovalSettingsModel continuumRemovalSettingsModel = dbHandler.getContinuumRemovalSettings(model.Id,
                                                                                                                getUserId());
            if (continuumRemovalSettingsModel != null)
                return new JsonResult(new GenericResponseModel(continuumRemovalSettingsModel));
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }

        [HttpGet]
        public IActionResult GetSpectrumByParentIdAndSpectrumType(GenericRequestByParentIdAndSpectrumTypeModel model)
        {
            ISpectrumModel spectrumModel = dbHandler.getSpectrumByParentIdAndSpectrumType(model.ParentId,
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
            int id = dbHandler.getSpectrumIdByParentIdAndSpectrumType(model.Id,
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
            SpectrumModel spectrumModel = dbHandler.getSpectrumGeneralInfo(model.Id);

            return new JsonResult(spectrumModel);
        }

        #region BAND ANALYSIS
        [HttpGet]
        public IActionResult GetBandAnalysisData(BandAnalysisModel model)
        {
            var bandAnalysisModel = dbHandler.getBandAnalysisData(model.Id,
                                                                  getUserId());
            if (bandAnalysisModel != null)
                return new JsonResult(new GenericResponseModel() { IsOk = true, ResponseObject = bandAnalysisModel });
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }

        [HttpGet]
        public IActionResult GetBandsAnalysisData(BandAnalysisModel model)
        {
            var bandsAnalysisModel = dbHandler.getBandsAnalysisData(model.FileId,
                                                                    getUserId());
            if (bandsAnalysisModel != null)
                return new JsonResult(new GenericResponseModel() { IsOk = true, ResponseObject = bandsAnalysisModel });
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }

        [HttpPost]
        public IActionResult IsBandOverlappingWithExistingOne([FromBody] BandAnalysisModel model)
        {
            bool isOverlapping = dbHandler.isBandOverlappingWithExistingOne(model.FileId,
                                                                            model.LeftBoundary,
                                                                            model.RightBoundary,
                                                                            getUserId());
            return new JsonResult(new GenericResponseModel() { BoolValue = isOverlapping });
        }

        [HttpPost]
        public async Task<IActionResult> SaveBandAnalysisData([FromBody] BandAnalysisModel model)
        {
            (bool isOk, int id) result = await dbHandler.upsertBandAnalysisDataAsync(model.FileId,
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

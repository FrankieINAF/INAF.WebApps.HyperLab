using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Spectrum;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Spectrum.BandAnalysis;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Spectrum.ProcessedSpectraInfo.Alignment;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Spectrum.ProcessedSpectraInfo.ContinuumRemoval;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Requests;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Responses;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using INAF.Libraries.Net.CommonWebAppModels.Models.SpectraFiles;
using INAF.Libraries.Net.HyperLab.CommonModels.Values;
using INAF.Libraries.Net.HyperLab.CommonModels.Extensions;
using static INAF.Libraries.Net.HyperLab.CommonModels.Values.Enums;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Files;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Spectrum.ProcessedSpectraInfo.Smoothing;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Spectrum.SpectrumVersions;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Requests.SaveSpectrum;

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

        #region GET
        #region SPECTRA PROCESSING SETTINGS
        [HttpGet]
        public IActionResult GetAlignmentSettings(GenericRequestByIdModel model)
        {
            AlignmentSettingsModel? alignmentSettingsModel = dbHandlerSLabData.getAlignmentSettings(model.Id,
                                                                                                   getUserId());
            if (alignmentSettingsModel != null)
            {
                switch (getCallerContext())
                {
                    case Enums.CallerContext.Web:
                        return new JsonResult(new GenericResponseModel(alignmentSettingsModel));

                    case Enums.CallerContext.App:
                        return new JsonResult(alignmentSettingsModel);
                }
            }   
            else
            {
                switch (getCallerContext())
                {
                    case Enums.CallerContext.Web:
                        return new JsonResult(GenericResponseModel.CreateErrorResponse());

                    case Enums.CallerContext.App:
                        return new EmptyResult();
                }
            }

            return new EmptyResult();
        }

        [HttpGet]
        public IActionResult GetContinuumRemovalSettings(GenericRequestByIdModel model)
        {
            ContinuumRemovalSettingsModel? continuumRemovalSettingsModel = dbHandlerSLabData.getContinuumRemovalSettings(model.Id,
                                                                                                                         getUserId());
            if (continuumRemovalSettingsModel != null)
            {
                switch (getCallerContext())
                {
                    case Enums.CallerContext.Web:
                        return new JsonResult(new GenericResponseModel(continuumRemovalSettingsModel));

                    case Enums.CallerContext.App:
                        return new JsonResult(continuumRemovalSettingsModel);
                }
            }
            else
            {
                switch (getCallerContext())
                {
                    case Enums.CallerContext.Web:
                        return new JsonResult(GenericResponseModel.CreateErrorResponse());

                    case Enums.CallerContext.App:
                        return new EmptyResult();
                }
            }

            return new EmptyResult();
        }

        [HttpGet]
        public IActionResult GetSmoothingSettings(GenericRequestByIdModel model)
        {
            SmoothingSettingsModel? smoothingSettings = dbHandlerSLabData.getSmoothingSettings(model.Id,
                                                                                               getUserId());
            if (smoothingSettings != null)
            {
                switch (getCallerContext())
                {
                    case Enums.CallerContext.Web:
                        return new JsonResult(new GenericResponseModel(smoothingSettings));

                    case Enums.CallerContext.App:
                        return new JsonResult(smoothingSettings);
                }
            }
            else
            {
                switch (getCallerContext())
                {
                    case Enums.CallerContext.Web:
                        return new JsonResult(GenericResponseModel.CreateErrorResponse());

                    case Enums.CallerContext.App:
                        return new EmptyResult();
                }
            }

            return new EmptyResult();
        }
        #endregion

        #region CHECK SPECTRUM SAVED ON CLOUD
        [HttpGet]
        public IActionResult IsAnySpectrumTypeSavedOnCloud(IsAnySpectrumTypeSavedOnCloudRequestModel model)
        {
            (bool isSaved, int id) result = dbHandlerSLabData.isAnySpectrumTypeSaved(model.Filename, model.SpectrumTypes);
            return new JsonResult(result.ToGenericValueStringResponse());
        }

        [HttpGet]
        public IActionResult IsSpectrumTypeSavedOnCloud(IsSpectrumTypeSavedOnCloudRequestModel model)
        {
            (bool isSaved, int id) result = dbHandlerSLabData.isSpectrumTypeSaved(model.Filename, model.SpectrumType, getUserId());
            return new JsonResult(result.ToGenericValueStringResponse());
        }

        [HttpGet]
        public IActionResult IsSpectrumTypeSavedWithCountOnCloud(IsSpectrumTypeSavedOnCloudRequestModel model)
        {
            int count = dbHandlerSLabData.isSpectrumTypeSavedWithCount(model.Filename, model.SpectrumType, getUserId());
            return new JsonResult(new GenericResponseModel(count));
        }
        #endregion

        [HttpGet]
        public IActionResult GetChildrenSpectraTypes(int SpectrumTypeId)
        {
            var dbHandlerSLabData = serviceProvider.GetRequiredService<DbHandlerHyperLabData>();
            List<SpectrumType> childrenSpectraTypes = dbHandlerSLabData.getChildrenSpectraTypes(SpectrumTypeId.ToSpectrumType());
            if (childrenSpectraTypes.Any())
            {
                childrenSpectraTypes.Add(SpectrumTypeId.ToSpectrumType());
                return new JsonResult(childrenSpectraTypes);
            }
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult GetSpectraTypesParents()
        {
            var keyValuePairs = dbHandlerSLabData.getSpectraTypesParents();
            return new JsonResult(keyValuePairs);
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
        public IActionResult GetSpectrumData(GenericRequestByIdModel model)
        {
            RawRefSpectrumDataModel? rawRefSpectrumData = dbHandlerSLabData.getSpectrumDataInfo(model.Id,
                                                                                                getUserId());
            if (rawRefSpectrumData != null)
                return new JsonResult(rawRefSpectrumData);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult GetSpectrumFile(GenericRequestByIdModel model)
        {
            FileSpectrumModel? parentSpectrum = dbHandlerSLabData.getSpectrumInfo(model.Id,
                                                                                  getUserId());
            if (parentSpectrum != null)
                return new JsonResult(parentSpectrum);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult GetSpectrumIdByNameAndSpectrumType(GenericRequestByParametersModel model)
        {
            if (string.IsNullOrEmpty(model.Text) || string.IsNullOrEmpty(model.Type))
                return new EmptyResult();

            SpectrumModel? spectrum = dbHandlerSLabData.getSpectrumId(model.Text,
                                                                      model.Type.ToSpectrumType(),
                                                                      getUserId());
            if (spectrum != null)
                return new JsonResult(spectrum);
            else
                return new EmptyResult();
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

        [HttpGet]
        public IActionResult GetSpectrumVersions(IsSpectrumTypeSavedOnCloudRequestModel model)
        {
            int userId = getUserId();
            IEnumerable<SpectrumVersionModel>? spectrumVersions = dbHandlerSLabData.getSpectrumVersions(model.Filename,
                                                                                                        model.SpectrumType,
                                                                                                        userId);

            if (spectrumVersions != null && spectrumVersions.Any())
                return new JsonResult(spectrumVersions);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult IsWhiteSpectrum(GenericRequestByTextModel model)
        {
            var isWhiteResponse = dbHandlerSLabData.isWhiteSpectrum(model.Text);
            return new JsonResult(isWhiteResponse);
        }
        #endregion

        #region POST
        [HttpPost]
        public async Task<IActionResult> DeleteRecursivelySpectrumChildren([FromBody] DeleteSpectrumRequestModel model)
        {
            return new JsonResult(await dbHandlerSLabData.deleteRecursivelyChildrenAsync(model.Id, model.SpectrumType, getUserId()));
        }

        [HttpPost]
        public async Task<IActionResult> DeleteSpectrum([FromBody] DeleteSpectrumRequestModel model)
        {
            return new JsonResult(await dbHandlerSLabData.deleteSpectrumFileProcedureAsync(model.Id, getUserId()));
        }

        #region SAVE SPECTRUM OF TYPE
        [HttpPost]
        public async Task<IActionResult> SaveSpectrumOfTypeAligned([FromBody] SaveSpectrumOfTypeAlignedRequestModel model)
        {
            if (model == null)
            {
                logger.LogError($"{nameof(SaveSpectrumOfTypeAligned)} - model is null");
                return new EmptyResult();
            }

            /* save file */
            (bool isOk, int id) result = await dbHandlerSLabData.saveSpectrumFileOfTypeAlignedProcedureAsync(model,
                                                                                                     getUserId());
            return new JsonResult(result.ToGenericValueStringResponse());
        }

        [HttpPost]
        public async Task<IActionResult> SaveSpectrumOfTypeContinuumRemoved([FromBody] SaveSpectrumOfTypeContinuumRemovedRequestModel model)
        {
            if (model == null)
            {
                logger.LogError($"{nameof(SaveSpectrumOfTypeContinuumRemoved)} - model is null");
                return new EmptyResult();
            }

            /* save file */
            (bool isOk, int id, List<SegmentResponseModel> segmentsResult) result = await dbHandlerSLabData.upsertSpectrumFileOfTypeContinuumRemovedProcedureAsync(model,
                                                                                                                                                            getUserId());
            return new JsonResult(result.ToSegmentsProcessingResponseModel());
        }

        [HttpPost]
        public async Task<IActionResult> SaveAsCopySpectrumOfTypeContinuumRemoved([FromBody] SaveSpectrumOfTypeContinuumRemovedRequestModel model)
        {
            if (model == null)
            {
                logger.LogError($"{nameof(SaveAsCopySpectrumOfTypeContinuumRemoved)} - model is null");
                return new EmptyResult();
            }

            /* save file */
            (bool isOk, int id, List<SegmentResponseModel> segmentsResult) result = await dbHandlerSLabData.saveAsCopySpectrumFileOfTypeContinuumRemovedProcedureAsync(model,
                                                                                                                                                                  getUserId());
            return new JsonResult(result.ToSegmentsProcessingResponseModel());
        }

        [HttpPost]
        public async Task<IActionResult> SaveSpectrumOfTypeRaw([FromBody] SaveSpectrumOfTypeRawRequestModel model)
        {
            if (model == null)
            {
                logger.LogError($"{nameof(SaveSpectrumOfTypeRaw)} - model is null");
                return new EmptyResult();
            }

            /* save file */
            (bool isOk, int id) result = await dbHandlerSLabData.saveSpectrumFileOfTypeRawProcedureAsync(model,
                                                                                                         getUserId());
            return new JsonResult(result.ToGenericValueStringResponse());
        }

        [HttpPost]
        public async Task<IActionResult> SaveSpectrumOfTypeSmoothed([FromBody] SaveSpectrumOfTypeSmoothedRequestModel model)
        {
            if (model == null)
            {
                logger.LogError($"{nameof(SaveSpectrumOfTypeSmoothed)} - model is null");
                return new EmptyResult();
            }

            /* save file */
            (bool isOk, int id, List<SegmentResponseModel> segmentsResult) result = await dbHandlerSLabData.saveSpectrumFileOfTypeSmoothedProcedureAsync(model,
                                                                                                                                                 getUserId());
            return new JsonResult(result.ToSegmentsProcessingResponseModel());
        }

        [HttpPost]
        public async Task<IActionResult> SaveAsCopySpectrumOfTypeSmoothed([FromBody] SaveSpectrumOfTypeSmoothedRequestModel model)
        {
            if (model == null)
            {
                logger.LogError($"{nameof(SaveAsCopySpectrumOfTypeSmoothed)} - model is null");
                return new EmptyResult();
            }

            /* save file */
            (bool isOk, int id, List<SegmentResponseModel> segmentsResult) result = await dbHandlerSLabData.saveAsCopySpectrumFileOfTypeSmoothedProcedureAsync(model,
                                                                                                                                                               getUserId());
            return new JsonResult(result.ToSegmentsProcessingResponseModel());
        }
        #endregion
        #endregion

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

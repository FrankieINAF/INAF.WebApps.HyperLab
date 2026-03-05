using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.CommonWebAppModels.Models.Responses;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.Libraries.Net.HyperLab.CommonModels.Extensions;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Files;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Spectrum;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Spectrum.BandAnalysis;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Spectrum.ProcessedSpectraInfo.Alignment;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Spectrum.ProcessedSpectraInfo.ContinuumRemoval;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Spectrum.ProcessedSpectraInfo.Smoothing;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Spectrum.SpectrumVersions;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Requests;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Requests.SaveSpectrum;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Responses;
using INAF.Libraries.Net.HyperLab.CommonModels.Values;
using INAF.Libraries.Net.Math.Models;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static INAF.Libraries.Net.HyperLab.CommonModels.Values.Enums;

namespace INAF.WebApps.HyperLab.Controllers
{
    [Authorize]
    [CheckIsLoginValid]
    public class SpectraFilesController : BaseController
    {
        private readonly DbHandlerHyperLabUsers dbHandlerHyperLabUsers;
        private readonly DbHandlerHyperLabData dbHandlerHyperLabData;

        public SpectraFilesController(IServiceProvider serviceProvider,
                                      ILogger<SpectraFilesController> logger,
                                      DbHandlerHyperLabUsers dbHandlerHyperLabUsers,
                                      DbHandlerHyperLabData dbHandlerHyperLabData) : base(serviceProvider, logger)
        {
            this.dbHandlerHyperLabUsers = dbHandlerHyperLabUsers;
            this.dbHandlerHyperLabData = dbHandlerHyperLabData;
        }

        #region GET
        #region SPECTRA PROCESSING SETTINGS
        [HttpGet]
        public IActionResult GetAlignmentSettings(GenericRequestByIdModel model)
        {
            AlignmentSettingsModel? alignmentSettingsModel = dbHandlerHyperLabData.getAlignmentSettings(model.Id,
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
            ContinuumRemovalSettingsModel? continuumRemovalSettingsModel = dbHandlerHyperLabData.getContinuumRemovalSettings(model.Id,
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
            SmoothingSettingsModel? smoothingSettings = dbHandlerHyperLabData.getSmoothingSettings(model.Id,
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
            if (string.IsNullOrEmpty(model.Filename) || model.SpectrumTypes == null || !model.SpectrumTypes.Any())
                return new JsonResult(GenericValueStringResponseModel.CreateErrorResponse());

            (bool isSaved, int id) result = dbHandlerHyperLabData.isAnySpectrumTypeSaved(model.Filename, model.SpectrumTypes, getUserId());
            return new JsonResult(result.ToGenericValueStringResponse());
        }

        [HttpGet]
        public IActionResult IsSpectrumTypeSavedOnCloud(IsSpectrumTypeSavedOnCloudRequestModel model)
        {
            if (string.IsNullOrEmpty(model.Filename))
                return new JsonResult(GenericValueStringResponseModel.CreateErrorResponse());

            (bool isSaved, int id) result = dbHandlerHyperLabData.isSpectrumTypeSaved(model.Filename,
                                                                                      model.SpectrumType,
                                                                                      model.SpectrumSource,
                                                                                      model.SpectrumLevel,
                                                                                      getUserId());
            return new JsonResult(result.ToGenericValueStringResponse());
        }

        [HttpGet]
        public IActionResult IsSpectrumTypeSavedWithCountOnCloud(IsSpectrumTypeSavedOnCloudRequestModel model)
        {
            if (string.IsNullOrEmpty(model.Filename))
                return new JsonResult(GenericResponseModel.CreateErrorResponse());

            int count = dbHandlerHyperLabData.isSpectrumTypeSavedWithCount(model.Filename, model.SpectrumType, model.SpectrumLevel, getUserId());
            return new JsonResult(new GenericResponseModel(count));
        }
        #endregion

        [HttpGet]
        public IActionResult GetSpectrumAsCsv(GenericRequestByIdModel model)
        {
            SpectrumModel? spectrumMinimalInfo = dbHandlerHyperLabData.getSpectrumMinimalInfo(model.Id,
                                                                                              getUserId());
            if (spectrumMinimalInfo == null)
                return new EmptyResult();

            List<PointModel>? points = dbHandlerHyperLabData.getSpectrumPointsById(model.Id,
                                                                                   getUserId());

            if (points == null || !points.Any())
                return new EmptyResult();

            SpectrumModel spectrumModel = new SpectrumModel()
            {
                Points = points
            };
            string? csv = spectrumModel.ToTxt();

            if (string.IsNullOrEmpty(csv))
                return new EmptyResult();

            FileSpectrumModel fileSpectrumModel = new FileSpectrumModel()
            {
                Filename = spectrumMinimalInfo.Filename,
                TypeId = spectrumMinimalInfo.TypeId,
                Csv = csv
            };

            return new JsonResult(new GenericResponseModel(fileSpectrumModel));
        }

        [HttpGet]
        public IActionResult GetSpectrumAsXml(GenericRequestByIdModel model)
        {
            var fileSpectrumModel = dbHandlerHyperLabData.getSpectrumInfo(model.Id,
                                                                          getUserId());
            if (fileSpectrumModel == null)
                return new EmptyResult();

            return new JsonResult(new GenericResponseModel(fileSpectrumModel));
        }

        [HttpGet]
        public IActionResult GetSpectrumById(GenericRequestByIdModel model)
        {
            ISpectrumModel? spectrumModel = dbHandlerHyperLabData.getSpectrumById(model.Id,
                                                                                  getUserId());
            if (spectrumModel == null)
                return new EmptyResult();

            return new JsonResult(spectrumModel);
        }

        [HttpGet]
        public IActionResult GetSpectrumByParentIdAndSpectrumType(GenericRequestByParentIdAndSpectrumTypeModel model)
        {
            ISpectrumModel? spectrumModel = dbHandlerHyperLabData.getSpectrumByParentIdAndSpectrumType(model.ParentId,
                                                                                                       model.SpectrumType,
                                                                                                       getUserId());
            if (spectrumModel != null)
            {
                switch (getCallerContext())
                {
                    case Enums.CallerContext.Web:
                        return new JsonResult(new GenericResponseModel(spectrumModel));

                    case Enums.CallerContext.App:
                        return new JsonResult(spectrumModel);

                    default:
                        return new JsonResult(GenericResponseModel.CreateErrorResponse());
                }
            }
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }

        [HttpGet]
        public IActionResult GetSpectrumData(GenericRequestByIdModel model)
        {
            RawRefSpectrumDataModel? rawRefSpectrumData = dbHandlerHyperLabData.getSpectrumDataInfo(model.Id,
                                                                                                    getUserId());
            if (rawRefSpectrumData != null)
                return new JsonResult(rawRefSpectrumData);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult GetSpectrumFile(GenericRequestByIdModel model)
        {
            FileSpectrumModel? parentSpectrum = dbHandlerHyperLabData.getSpectrumInfo(model.Id,
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

            SpectrumModel? spectrum = dbHandlerHyperLabData.getSpectrumIdByNameAndType(model.Text,
                                                                                       model.Type.ToSpectrumType(),
                                                                                       model.Source.ToSpectrumSource(),
                                                                                       model.Level,
                                                                                       getUserId());
            if (spectrum != null)
                return new JsonResult(spectrum);
            else
                return new JsonResult(GenericResponseModel.CreateSuccessResponse());
        }

        [HttpGet]
        public IActionResult GetSpectrumIdByParentIdAndSpectrumType(IdAndSpectrumTypeRequestModel model)
        {
            int id = dbHandlerHyperLabData.getSpectrumIdByParentIdAndSpectrumType(model.Id,
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
            SpectrumModel? spectrumModel = dbHandlerHyperLabData.getSpectrumMinimalInfo(model.Id,
                                                                                        getUserId());

            return new JsonResult(spectrumModel);
        }

        [HttpGet]
        public IActionResult GetSpectrumParentIdById(GenericRequestByIdModel model)
        {
            var spectrum = dbHandlerHyperLabData.getSpectrumById(model.Id, getUserId());
            if (spectrum == null)
                return new EmptyResult();
            return new JsonResult(new GenericResponseModel() { IsOk = true, Id = spectrum.ParentId.HasValue ? spectrum.ParentId.Value : 0 });
        }

        [HttpGet]
        public IActionResult GetSpectrumTypeById(GenericRequestByIdModel model)
        {
            var spectrum = dbHandlerHyperLabData.getSpectrumById(model.Id, getUserId());
            if (spectrum == null)
                return new EmptyResult();

            return new JsonResult(new GenericValueStringResponseModel() { IsOk = true, Value = ((int)spectrum.Type).ToString() });
        }

        [HttpGet]
        public IActionResult GetSpectrumTypeByTypeLabel(GenericRequestByTextModel model)
        {
            if (string.IsNullOrEmpty(model.Text))
                return new EmptyResult();

            SpectrumType spectrumType = dbHandlerHyperLabData.getSpectrumTypeByTypeLabel(model.Text);

            return new JsonResult(new GenericResponseModel() { IsOk = true, Id = (int)spectrumType });
        }

        [HttpGet]
        public IActionResult GetSpectrumVersions(IsSpectrumTypeSavedOnCloudRequestModel model)
        {
            if (string.IsNullOrEmpty(model.Filename))
                return new EmptyResult();

            IEnumerable<SpectrumVersionModel>? spectrumVersions = dbHandlerHyperLabData.getSpectrumVersions(model.Filename,
                                                                                                            model.SpectrumType,
                                                                                                            model.SpectrumSource,
                                                                                                            model.SpectrumLevel,
                                                                                                            getUserId());

            if (spectrumVersions != null && spectrumVersions.Any())
                return new JsonResult(spectrumVersions);
            else
                return new EmptyResult();
        }
        #endregion

        #region POST
        [HttpPost]
        public async Task<IActionResult> DeleteRecursivelySpectrumChildren([FromBody] DeleteSpectrumRequestModel model)
        {
            return new JsonResult(await dbHandlerHyperLabData.deleteRecursivelyChildrenAsync(model.Id, model.SpectrumType, getUserId()));
        }

        [HttpPost]
        public async Task<IActionResult> DeleteSpectrum([FromBody] DeleteSpectrumRequestModel model)
        {
            if (await dbHandlerHyperLabData.deleteSpectrumFileProcedureAsync(model.Id, getUserId()))
                return new JsonResult(GenericResponseModel.CreateSuccessResponse());
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }

        #region SAVE SPECTRUM OF TYPE
        [HttpPost]
        public async Task<IActionResult> SaveExternalSpectrum([FromBody] SaveSpectrumOfTypeRawRequestModel model)
        {
            if (model == null)
            {
                logger.LogError($"{nameof(SaveExternalSpectrum)} - model is null");
                return new EmptyResult();
            }

            /* save file */
            (bool isOk, int id) result = await dbHandlerHyperLabData.saveSpectrumFileOfTypeRawProcedureAsync(model,
                                                                                                             getUserId(),
                                                                                                             getScientificResponsibleUserId());
            return new JsonResult(result.ToGenericValueStringResponse());
        }

        [HttpPost]
        public async Task<IActionResult> SaveSpectrumOfTypeAligned([FromBody] SaveSpectrumOfTypeAlignedRequestModel model)
        {
            if (model == null)
            {
                logger.LogError($"{nameof(SaveSpectrumOfTypeAligned)} - model is null");
                return new EmptyResult();
            }

            /* save file */
            (bool isOk, int id) result = await dbHandlerHyperLabData.saveSpectrumFileOfTypeAlignedProcedureAsync(model,
                                                                                                                 getUserId(),
                                                                                                                 getScientificResponsibleUserId());
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
            (bool isOk, int id, List<SegmentResponseModel> segmentsResult) result = await dbHandlerHyperLabData.upsertSpectrumFileOfTypeContinuumRemovedProcedureAsync(model,
                                                                                                                                                                       getUserId(),
                                                                                                                                                                       getScientificResponsibleUserId());
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
            (bool isOk, int id, List<SegmentResponseModel> segmentsResult) result = await dbHandlerHyperLabData.saveAsCopySpectrumFileOfTypeContinuumRemovedProcedureAsync(model,
                                                                                                                                                                           getUserId(),
                                                                                                                                                                           getScientificResponsibleUserId());
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
            (bool isOk, int id) result = await dbHandlerHyperLabData.saveSpectrumFileOfTypeRawProcedureAsync(model,
                                                                                                             getUserId(),
                                                                                                             getScientificResponsibleUserId());
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
            (bool isOk, int id, List<SegmentResponseModel> segmentsResult) result = await dbHandlerHyperLabData.saveSpectrumFileOfTypeSmoothedProcedureAsync(model,
                                                                                                                                                             getUserId(),
                                                                                                                                                             getScientificResponsibleUserId());
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
            (bool isOk, int id, List<SegmentResponseModel> segmentsResult) result = await dbHandlerHyperLabData.saveAsCopySpectrumFileOfTypeSmoothedProcedureAsync(model,
                                                                                                                                                                   getUserId(),
                                                                                                                                                                   getScientificResponsibleUserId());
            return new JsonResult(result.ToSegmentsProcessingResponseModel());
        }
        #endregion
        #endregion

        #region BAND ANALYSIS
        [HttpGet]
        public IActionResult GetBandAnalysisData(BandAnalysisModel model)
        {
            var bandAnalysisModel = dbHandlerHyperLabData.getBandAnalysisData(model.Id,
                                                                          getUserId());
            if (bandAnalysisModel != null)
                return new JsonResult(new GenericResponseModel() { IsOk = true, ResponseObject = bandAnalysisModel });
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }

        [HttpGet]
        public IActionResult GetBandsAnalysisData(BandAnalysisModel model)
        {
            var bandsAnalysisModel = dbHandlerHyperLabData.getBandsAnalysisData(model.FileId,
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

            bool isOverlapping = dbHandlerHyperLabData.isBandOverlappingWithExistingOne(model.FileId,
                                                                                        model.LeftBoundary,
                                                                                        model.RightBoundary,
                                                                                        bandOverlapRange,
                                                                                        getUserId());
            return new JsonResult(new GenericResponseModel() { IsOk = isOverlapping });
        }

        [HttpPost]
        public async Task<IActionResult> SaveBandAnalysisData([FromBody] BandAnalysisModel model)
        {
            (bool isOk, int id) result = await dbHandlerHyperLabData.upsertBandAnalysisDataAsync(model.FileId,
                                                                                                 model.Id,
                                                                                                 model.LeftBoundary,
                                                                                                 model.RightBoundary,
                                                                                                 model.BandCenterX,
                                                                                                 model.BandDepth,
                                                                                                 model.BandArea,
                                                                                                 model.FwhmLeftBoundary,
                                                                                                 model.FwhmRightBoundary,
                                                                                                 getUserId());
            if (result.isOk)
                return new JsonResult(new GenericResponseModel() { Id = result.id, IsOk = true });
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }
        #endregion
    }
}

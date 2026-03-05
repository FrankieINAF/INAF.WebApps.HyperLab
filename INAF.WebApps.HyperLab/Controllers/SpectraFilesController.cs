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
        public async Task<IActionResult> GetAlignmentSettings(GenericRequestByIdModel model)
        {
            AlignmentSettingsModel? alignmentSettingsModel = dbHandlerHyperLabData.getAlignmentSettings(model.Id,
                                                                                                        await getUserIdAsync());
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
        public async Task<IActionResult> GetContinuumRemovalSettings(GenericRequestByIdModel model)
        {
            ContinuumRemovalSettingsModel? continuumRemovalSettingsModel = dbHandlerHyperLabData.getContinuumRemovalSettings(model.Id,
                                                                                                                             await getUserIdAsync());

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
        public async Task<IActionResult> GetSmoothingSettings(GenericRequestByIdModel model)
        {
            SmoothingSettingsModel? smoothingSettings = dbHandlerHyperLabData.getSmoothingSettings(model.Id,
                                                                                                   await getUserIdAsync());
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
        public async Task<IActionResult> IsAnySpectrumTypeSavedOnCloud(IsAnySpectrumTypeSavedOnCloudRequestModel model)
        {
            if (string.IsNullOrEmpty(model.Filename) || model.SpectrumTypes == null || !model.SpectrumTypes.Any())
                return new JsonResult(GenericValueStringResponseModel.CreateErrorResponse());

            (bool isSaved, int id) result = dbHandlerHyperLabData.isAnySpectrumTypeSaved(model.Filename, model.SpectrumTypes, await getUserIdAsync());
            return new JsonResult(result.ToGenericValueStringResponse());
        }

        [HttpGet]
        public async Task<IActionResult> IsSpectrumTypeSavedOnCloud(IsSpectrumTypeSavedOnCloudRequestModel model)
        {
            if (string.IsNullOrEmpty(model.Filename))
                return new JsonResult(GenericValueStringResponseModel.CreateErrorResponse());

            (bool isSaved, int id) result = dbHandlerHyperLabData.isSpectrumTypeSaved(model.Filename,
                                                                                      model.SpectrumType,
                                                                                      model.SpectrumSource,
                                                                                      model.SpectrumLevel,
                                                                                      await getUserIdAsync());
            return new JsonResult(result.ToGenericValueStringResponse());
        }

        [HttpGet]
        public async Task<IActionResult> IsSpectrumTypeSavedWithCountOnCloud(IsSpectrumTypeSavedOnCloudRequestModel model)
        {
            if (string.IsNullOrEmpty(model.Filename))
                return new JsonResult(GenericResponseModel.CreateErrorResponse());

            int count = dbHandlerHyperLabData.isSpectrumTypeSavedWithCount(model.Filename, model.SpectrumType, model.SpectrumLevel, await getUserIdAsync());
            return new JsonResult(new GenericResponseModel(count));
        }
        #endregion

        [HttpGet]
        public async Task<IActionResult> GetSpectrumAsCsv(GenericRequestByIdModel model)
        {
            SpectrumModel? spectrumMinimalInfo = dbHandlerHyperLabData.getSpectrumMinimalInfo(model.Id,
                                                                                              await getUserIdAsync());
            if (spectrumMinimalInfo == null)
                return new EmptyResult();

            List<PointModel>? points = dbHandlerHyperLabData.getSpectrumPointsById(model.Id,
                                                                                   await getUserIdAsync());

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
        public async Task<IActionResult> GetSpectrumAsXml(GenericRequestByIdModel model)
        {
            var fileSpectrumModel = dbHandlerHyperLabData.getSpectrumInfo(model.Id,
                                                                          await getUserIdAsync());
            if (fileSpectrumModel == null)
                return new EmptyResult();

            return new JsonResult(new GenericResponseModel(fileSpectrumModel));
        }

        [HttpGet]
        public async Task<IActionResult> GetSpectrumById(GenericRequestByIdModel model)
        {
            ISpectrumModel? spectrumModel = dbHandlerHyperLabData.getSpectrumById(model.Id,
                                                                                  await getUserIdAsync());
            if (spectrumModel == null)
                return new EmptyResult();

            return new JsonResult(spectrumModel);
        }

        [HttpGet]
        public async Task<IActionResult> GetSpectrumByParentIdAndSpectrumType(GenericRequestByParentIdAndSpectrumTypeModel model)
        {
            ISpectrumModel? spectrumModel = dbHandlerHyperLabData.getSpectrumByParentIdAndSpectrumType(model.ParentId,
                                                                                                       model.SpectrumType,
                                                                                                       await getUserIdAsync());
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
        public async Task<IActionResult> GetSpectrumData(GenericRequestByIdModel model)
        {
            RawRefSpectrumDataModel? rawRefSpectrumData = dbHandlerHyperLabData.getSpectrumDataInfo(model.Id,
                                                                                                    await getUserIdAsync());
            if (rawRefSpectrumData != null)
                return new JsonResult(rawRefSpectrumData);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public async Task<IActionResult> GetSpectrumFile(GenericRequestByIdModel model)
        {
            FileSpectrumModel? parentSpectrum = dbHandlerHyperLabData.getSpectrumInfo(model.Id,
                                                                                      await getUserIdAsync());
            if (parentSpectrum != null)
                return new JsonResult(parentSpectrum);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public async Task<IActionResult> GetSpectrumIdByNameAndSpectrumType(GenericRequestByParametersModel model)
        {
            if (string.IsNullOrEmpty(model.Text) || string.IsNullOrEmpty(model.Type))
                return new EmptyResult();

            SpectrumModel? spectrum = dbHandlerHyperLabData.getSpectrumIdByNameAndType(model.Text,
                                                                                       model.Type.ToSpectrumType(),
                                                                                       model.Source.ToSpectrumSource(),
                                                                                       model.Level,
                                                                                       await getUserIdAsync());
            if (spectrum != null)
                return new JsonResult(spectrum);
            else
                return new JsonResult(GenericResponseModel.CreateSuccessResponse());
        }

        [HttpGet]
        public async Task<IActionResult> GetSpectrumIdByParentIdAndSpectrumType(IdAndSpectrumTypeRequestModel model)
        {
            int id = dbHandlerHyperLabData.getSpectrumIdByParentIdAndSpectrumType(model.Id,
                                                                                  model.SpectrumType,
                                                                                  await getUserIdAsync());
            if (id != int.MinValue)
                return new JsonResult(new GenericResponseModel() { IsOk = true, Id = id });
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }

        [HttpGet]
        public async Task<IActionResult> GetSpectrumFilename(GenericRequestByIdModel model)
        {
            SpectrumModel? spectrumModel = dbHandlerHyperLabData.getSpectrumMinimalInfo(model.Id,
                                                                                        await getUserIdAsync());

            return new JsonResult(spectrumModel);
        }

        [HttpGet]
        public async Task<IActionResult> GetSpectrumParentIdById(GenericRequestByIdModel model)
        {
            var spectrum = dbHandlerHyperLabData.getSpectrumById(model.Id, await getUserIdAsync());
            if (spectrum == null)
                return new EmptyResult();
            return new JsonResult(new GenericResponseModel() { IsOk = true, Id = spectrum.ParentId.HasValue ? spectrum.ParentId.Value : 0 });
        }

        [HttpGet]
        public async Task<IActionResult> GetSpectrumTypeById(GenericRequestByIdModel model)
        {
            var spectrum = dbHandlerHyperLabData.getSpectrumById(model.Id, await getUserIdAsync());
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
        public async Task<IActionResult> GetSpectrumVersions(IsSpectrumTypeSavedOnCloudRequestModel model)
        {
            if (string.IsNullOrEmpty(model.Filename))
                return new EmptyResult();

            IEnumerable<SpectrumVersionModel>? spectrumVersions = dbHandlerHyperLabData.getSpectrumVersions(model.Filename,
                                                                                                            model.SpectrumType,
                                                                                                            model.SpectrumSource,
                                                                                                            model.SpectrumLevel,
                                                                                                            await getUserIdAsync());

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
            return new JsonResult(await dbHandlerHyperLabData.deleteRecursivelyChildrenAsync(model.Id, model.SpectrumType, await getUserIdAsync()));
        }

        [HttpPost]
        public async Task<IActionResult> DeleteSpectrum([FromBody] DeleteSpectrumRequestModel model)
        {
            if (await dbHandlerHyperLabData.deleteSpectrumFileProcedureAsync(model.Id, await getUserIdAsync()))
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
                                                                                                             await getUserIdAsync(),
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
                                                                                                                 await getUserIdAsync(),
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
                                                                                                                                                                       await getUserIdAsync(),
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
                                                                                                                                                                           await getUserIdAsync(),
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
                                                                                                             await getUserIdAsync(),
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
                                                                                                                                                             await getUserIdAsync(),
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
                                                                                                                                                                   await getUserIdAsync(),
                                                                                                                                                                   getScientificResponsibleUserId());
            return new JsonResult(result.ToSegmentsProcessingResponseModel());
        }
        #endregion
        #endregion

        #region BAND ANALYSIS
        [HttpGet]
        public async Task<IActionResult> GetBandAnalysisDataAsync(BandAnalysisModel model)
        {
            var bandAnalysisModel = dbHandlerHyperLabData.getBandAnalysisData(model.Id,
                                                                              await getUserIdAsync());
            if (bandAnalysisModel != null)
                return new JsonResult(new GenericResponseModel() { IsOk = true, ResponseObject = bandAnalysisModel });
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }

        [HttpGet]
        public async Task<IActionResult> GetBandsAnalysisDataAsync(BandAnalysisModel model)
        {
            var bandsAnalysisModel = dbHandlerHyperLabData.getBandsAnalysisData(model.FileId,
                                                                                await getUserIdAsync());
            if (bandsAnalysisModel != null)
                return new JsonResult(new GenericResponseModel() { IsOk = true, ResponseObject = bandsAnalysisModel });
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }

        [HttpPost]
        public async Task<IActionResult> IsBandOverlappingWithExistingOne([FromBody] BandAnalysisModel model)
        {
            int bandOverlapRange = dbHandlerHyperLabUsers.getUserSettingsBandOverlapRange(await getUserIdAsync());

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
                                                                                                 await getUserIdAsync());
            if (result.isOk)
                return new JsonResult(new GenericResponseModel() { Id = result.id, IsOk = true });
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }
        #endregion
    }
}

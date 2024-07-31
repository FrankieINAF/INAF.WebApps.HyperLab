using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.DB.SLabData;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Extensions;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.Spectrum;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.Spectrum.ProcessedSpectraInfo.Alignment;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.Spectrum.ProcessedSpectraInfo.ContinuumRemoval;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.WebApp.Requests;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.WebApp.Requests.SaveSpectrum;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.WebApp.Responses;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static INAF.Libraries.NetStandard.HyperLabCommonModels.Values.Enums;

namespace INAF.WebApps.HyperLab.Controllers
{
    [Authorize]
    [CheckIsLoginValid]
    public class AppSpectraFilesActionsController : BaseController
    {
        private readonly DbHandlerSLabData dbHandlerSLabData;
        public AppSpectraFilesActionsController(IServiceProvider serviceProvider,
                                                ILogger<AppSpectraFilesActionsController> logger,
                                                DbHandlerSLabData dbHandlerSLabData) : base(serviceProvider, logger)
        {
            this.dbHandlerSLabData = dbHandlerSLabData;
        }

        #region GET
        [HttpGet]
        public IActionResult GetAlignmentSettings(GenericRequestByIdModel model)
        {
            AlignmentSettingsModel? alignmentSettingsModel = dbHandlerSLabData.getAlignmentSettings(model.Id,
                                                                                                   getUserId());
            if (alignmentSettingsModel != null)
                return new JsonResult(alignmentSettingsModel);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult GetChildrenSpectraTypes(int SpectrumTypeId)
        {
            var dbHandlerSLabData = serviceProvider.GetRequiredService<DbHandlerSLabData>();
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
        public IActionResult GetContinuumRemovalSettings(GenericRequestByIdModel model)
        {
            ContinuumRemovalSettingsModel? continuumRemovalSettingsModel = dbHandlerSLabData.getContinuumRemovalSettings(model.Id,
                                                                                                                         getUserId());
            if (continuumRemovalSettingsModel != null)
                return new JsonResult(continuumRemovalSettingsModel);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult GetSpectrumVersions(IsSpectrumTypeSavedOnCloudRequestModel model)
        {
            IEnumerable<SpectrumModelVersion>? spectrumVersions = dbHandlerSLabData.getSpectrumVersions(model.Filename,
                                                                                                        model.SpectrumType,
                                                                                                        getUserId());
            if (spectrumVersions != null && spectrumVersions.Any())
                return new JsonResult(spectrumVersions);
            else
                return new EmptyResult();
        }

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
            /* save file */
            (bool isOk, int id) result = await dbHandlerSLabData.saveSpectrumFileOfTypeAlignedProcedureAsync(model,
                                                                                                     getUserId());
            return new JsonResult(result.ToGenericValueStringResponse());
        }

        [HttpPost]
        public async Task<IActionResult> SaveSpectrumOfTypeContinuumRemoved([FromBody] SaveSpectrumOfTypeContinuumRemovedRequestModel model)
        {
            /* save file */
            (bool isOk, int id, List<SegmentResponseModel> segmentsResult) result = await dbHandlerSLabData.upsertSpectrumFileOfTypeContinuumRemovedProcedureAsync(model,
                                                                                                                                                            getUserId());
            return new JsonResult(result.ToSegmentsProcessingResponseModel());
        }

        [HttpPost]
        public async Task<IActionResult> SaveAsCopySpectrumOfTypeContinuumRemoved([FromBody] SaveSpectrumOfTypeContinuumRemovedRequestModel model)
        {
            /* save file */
            (bool isOk, int id, List<SegmentResponseModel> segmentsResult) result = await dbHandlerSLabData.saveAsCopySpectrumFileOfTypeContinuumRemovedProcedureAsync(model,
                                                                                                                                                                  getUserId());
            return new JsonResult(result.ToSegmentsProcessingResponseModel());
        }

        [HttpPost]
        public async Task<IActionResult> SaveSpectrumOfTypeRaw([FromBody] SaveSpectrumOfTypeRawRequestModel model)
        {
            /* save file */
            (bool isOk, int id) result = await dbHandlerSLabData.saveSpectrumFileOfTypeRawProcedureAsync(model,
                                                                                                 getUserId());
            return new JsonResult(result.ToGenericValueStringResponse());
        }

        [HttpPost]
        public async Task<IActionResult> SaveSpectrumOfTypeSmoothed([FromBody] SaveSpectrumOfTypeSmoothedRequestModel model)
        {
            /* save file */
            (bool isOk, int id, List<SegmentResponseModel> segmentsResult) result = await dbHandlerSLabData.saveSpectrumFileOfTypeSmoothedProcedureAsync(model,
                                                                                                                                                 getUserId());
            return new JsonResult(result.ToSegmentsProcessingResponseModel());
        }


        [HttpPost]
        public async Task<IActionResult> SaveAsCopySpectrumOfTypeSmoothed([FromBody] SaveSpectrumOfTypeSmoothedRequestModel model)
        {
            /* save file */
            (bool isOk, int id, List<SegmentResponseModel> segmentsResult) result = await dbHandlerSLabData.saveAsCopySpectrumFileOfTypeSmoothedProcedureAsync(model,
                                                                                                                                                               getUserId());
            return new JsonResult(result.ToSegmentsProcessingResponseModel());
        }
        #endregion
        #endregion
    }
}

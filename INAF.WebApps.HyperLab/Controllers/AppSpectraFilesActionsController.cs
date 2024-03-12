using INAF.Libraries.Net.SLabDbLibrary;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.WebApp.Responses;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Extensions;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.WebApp.Requests;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.WebApp.Requests.SaveSpectrum;
using static INAF.Libraries.NetStandard.HyperLabCommonModels.Values.Enums;

namespace INAF.WebApps.HyperLab.Controllers
{
    [Authorize]
    [CheckIsLoginValid]
    public class AppSpectraFilesActionsController : BaseController
    {
        public AppSpectraFilesActionsController(DbHandler dbHandler,
                                                ILogger<AppSpectraFilesActionsController> logger) : base(dbHandler, logger)
        { }

        #region GET
        [HttpGet]
        public IActionResult GetChildrenSpectraTypes(int SpectrumTypeId)
        {
            List<SpectrumType> childrenSpectraTypes = dbHandler.getChildrenSpectraTypes(SpectrumTypeId.ToSpectrumType());
            if (childrenSpectraTypes.Any())
            {
                childrenSpectraTypes.Add(SpectrumTypeId.ToSpectrumType());
                return new JsonResult(childrenSpectraTypes);
            }
            else
                return new EmptyResult();
        }
        #endregion

        #region POST
        [HttpPost]
        public async Task<IActionResult> DeleteRecursivelySpectrumChildren([FromBody] DeleteSpectrumRequestModel model)
        {
            return new JsonResult(await dbHandler.deleteRecursivelyChildrenAsync(model.Id, model.SpectrumType, getUserId()));
        }

        [HttpPost]
        public async Task<IActionResult> DeleteSpectrum([FromBody] DeleteSpectrumRequestModel model)
        {
            return new JsonResult(await dbHandler.deleteSpectrumFileProcedureAsync(model.Id, getUserId()));
        }

        [HttpPost]
        public IActionResult IsAnySpectrumTypeSavedOnCloud([FromBody] IsAnySpectrumTypeSavedOnCloudRequestModel model)
        {
            (bool isSaved, int id) result = dbHandler.isAnySpectrumTypeSaved(model.Filename, model.SpectrumTypes);
            return new JsonResult(result.ToGenericValueStringResponse());
        }

        [HttpPost]
        public IActionResult IsSpectrumTypeSavedOnCloud([FromBody] IsSpectrumTypeSavedOnCloudRequestModel model)
        {
            (bool isSaved, int id) result = dbHandler.isSpectrumTypeSaved(model.Filename, model.SpectrumType, getUserId());
            return new JsonResult(result.ToGenericValueStringResponse());
        }

        #region save spectrum of type
        [HttpPost]
        public async Task<IActionResult> SaveSpectrumOfTypeAligned([FromBody] SaveSpectrumOfTypeAlignedRequestModel model)
        {
            /* save file */
            (bool isOk, int id) result = await dbHandler.saveSpectrumFileOfTypeAlignedProcedureAsync(model,
                                                                                                     getUserId());
            return new JsonResult(result.ToGenericValueStringResponse());
        }

        [HttpPost]
        public async Task<IActionResult> SaveSpectrumOfTypeContinuumRemoved([FromBody] SaveSpectrumOfTypeContinuumRemovedRequestModel model)
        {
            /* save file */
            (bool isOk, int id, List<SegmentResponseModel> segmentsResult) result = await dbHandler.upsertSpectrumFileOfTypeContinuumRemovedProcedureAsync(model,
                                                                                                                                                            getUserId());
            return new JsonResult(result.ToSegmentsProcessingResponseModel());
        }

        [HttpPost]
        public async Task<IActionResult> SaveAsCopySpectrumOfTypeContinuumRemoved([FromBody] SaveSpectrumOfTypeContinuumRemovedRequestModel model)
        {
            /* save file */
            (bool isOk, int id, List<SegmentResponseModel> segmentsResult) result = await dbHandler.saveAsCopySpectrumFileOfTypeContinuumRemovedProcedureAsync(model,
                                                                                                                                                                  getUserId());
            return new JsonResult(result.ToSegmentsProcessingResponseModel());
        }

        [HttpPost]
        public async Task<IActionResult> SaveSpectrumOfTypeRaw([FromBody] SaveSpectrumOfTypeRawRequestModel model)
        {
            /* save file */
            (bool isOk, int id) result = await dbHandler.saveSpectrumFileOfTypeRawProcedureAsync(model,
                                                                                                 getUserId());
            return new JsonResult(result.ToGenericValueStringResponse());
        }

        [HttpPost]
        public async Task<IActionResult> SaveSpectrumOfTypeSmoothed([FromBody] SaveSpectrumOfTypeSmoothedRequestModel model)
        {
            /* save file */
            (bool isOk, int id, List<SegmentResponseModel> segmentsResult) result = await dbHandler.saveSpectrumFileOfTypeSmoothedProcedureAsync(model,
                                                                                                                                                 getUserId());
            return new JsonResult(result.ToSegmentsProcessingResponseModel());
        }
        #endregion
        #endregion
    }
}

using INAF.Libraries.Net.SLabDbLibrary;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Extensions;
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
    public class UserSettingsController : BaseController
    {
        public UserSettingsController(DbHandler dbHandler,
                                      ILogger<BaseController> logger) : base(dbHandler, logger)
        { }

        [HttpGet]
        public IActionResult LoadAlignmentPanel()
        {
            return PartialView("Partials/_AlignmentPanel");
        }

        [HttpGet]
        public IActionResult LoadFitPanel()
        {
            return PartialView("Partials/_FitPanel");
        }

        [HttpGet]
        public IActionResult LoadSmoothingPanel()
        {
            return PartialView("Partials/_SmoothingPanel");
        }

        #region GET
        [HttpGet]
        public IActionResult GetUserSetting(KeyRequestModel model)
        {
            (bool isOk, string? value) result = dbHandler.getUserSettingsValue(getUserId(),
                                                                               model.Key);

            if (result.isOk)
                return new JsonResult(result.ToGenericValueStringResponse());
            else
                return new JsonResult(GenericValueStringResponseModel.CreateErrorResponse());
        }

        [HttpGet]
        public IActionResult GetUserSettingsByWildcard(KeyRequestModel model)
        {
            (bool isOk, List<KeyValueResponseModel>? values) result = dbHandler.getUserSettingsValuesByWildcard(getUserId(),
                                                                                                                model.Key);

            if (result.isOk)
                return new JsonResult(new KeysValuesResponseModel() { Responses = result.values });
            else
                return new JsonResult(KeysValuesResponseModel.CreateErrorResponse());
        }
        #endregion

        #region POST
        [HttpPost]
        public async Task<IActionResult> SetUserSetting([FromBody] KeyValueRequestModel model)
        {
            bool isOk = await dbHandler.setUserSettingsValueAsync(getUserId(),
                                                                  model.Key,
                                                                  model.Value);
            if (isOk)
                return new JsonResult(GenericResponseModel.CreateSuccessResponse());
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }
        #endregion

        #region DEFAULT FIT SEGMENTS
        [HttpGet]
        public IActionResult GetFitFunctions()
        {
            var fitMethods = dbHandler.readFitMethodModels();
            return new JsonResult(fitMethods);
        }
        #endregion

        #region PMIN-PMAX FIT
        [HttpGet]
        public IActionResult GetPXMinPXMaxMaxValueFunctions()
        {
            var fitMethods = dbHandler.readPXMinPXMaxFitMethodModels();
            return new JsonResult(fitMethods);
        }
        #endregion

        #region SPECTRA-TYPES RELATIONSHIPS
        [HttpGet]
        public IActionResult GetSpectraTypesParents()
        {
            var keyValuePairs = dbHandler.getSpectraTypesParents();
            return new JsonResult(keyValuePairs);
        }
        #endregion
    }
}

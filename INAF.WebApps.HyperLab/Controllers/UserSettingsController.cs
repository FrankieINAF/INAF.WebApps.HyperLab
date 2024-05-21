using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.Libraries.Net.DB.SLabData;
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
        private readonly DbHandlerHyperLabUsers dbHandlerHyperLabUsers;
        private readonly DbHandlerSLabData dbHandlerSLabData;

        public UserSettingsController(IServiceProvider serviceProvider,
                                      ILogger<UserSettingsController> logger,
                                      DbHandlerHyperLabUsers dbHandlerHyperLabUsers,
                                      DbHandlerSLabData dbHandlerSLabData) : base(serviceProvider, logger)
        {
            this.dbHandlerHyperLabUsers = dbHandlerHyperLabUsers;
            this.dbHandlerSLabData = dbHandlerSLabData;
        }

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
            (bool isOk, string? value) result = dbHandlerHyperLabUsers.getUserSettingsValue(getUserId(),
                                                                                            model.Key);

            if (result.isOk)
                return new JsonResult(result.ToGenericValueStringResponse());
            else
                return new JsonResult(GenericValueStringResponseModel.CreateErrorResponse());
        }

        [HttpGet]
        public IActionResult GetUserSettingsByWildcard(KeyRequestModel model)
        {
            (bool isOk, List<KeyValueResponseModel>? values) result = dbHandlerHyperLabUsers.getUserSettingsValuesByWildcard(getUserId(),
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
            bool isOk = await dbHandlerHyperLabUsers.setUserSettingsValueAsync(getUserId(),
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
            var fitMethods = dbHandlerSLabData.readFitMethodModels();
            return new JsonResult(fitMethods);
        }
        #endregion

        #region PMIN-PMAX FIT
        [HttpGet]
        public IActionResult GetPXMinPXMaxMaxValueFunctions()
        {
            var fitMethods = dbHandlerSLabData.readPXMinPXMaxFitMethodModels();
            return new JsonResult(fitMethods);
        }
        #endregion

        #region SPECTRA-TYPES RELATIONSHIPS
        [HttpGet]
        public IActionResult GetSpectraTypesParents()
        {
            var keyValuePairs = dbHandlerSLabData.getSpectraTypesParents();
            return new JsonResult(keyValuePairs);
        }
        #endregion
    }
}

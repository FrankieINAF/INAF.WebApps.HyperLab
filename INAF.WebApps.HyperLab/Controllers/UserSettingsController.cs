using INAF.Libraries.Net.CommonWebAppModels.Models.Responses;
using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.Libraries.Net.HyperLab.CommonModels.Extensions;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Requests;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Responses;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    public class UserSettingsController : BaseController
    {
        private readonly DbHandlerHyperLabUsers dbHandlerHyperLabUsers;

        public UserSettingsController(IServiceProvider serviceProvider,
                                      ILogger<UserSettingsController> logger,
                                      DbHandlerHyperLabUsers dbHandlerHyperLabUsers) : base(serviceProvider, logger)
        {
            this.dbHandlerHyperLabUsers = dbHandlerHyperLabUsers;
        }

        #region GET
        [HttpGet]
        public IActionResult GetUserSetting(KeyRequestModel model)
        {
            if (string.IsNullOrEmpty(model.Key))
                return new JsonResult(GenericValueStringResponseModel.CreateErrorResponse());

            (bool isOk, string? value) result = dbHandlerHyperLabUsers.getUserSettingsValue(getUserId(),
                                                                                            model.Key);

            if (result.isOk)
                return new JsonResult(result.ToGenericValueStringResponse());
            else
                return new JsonResult(GenericValueStringResponseModel.CreateErrorResponse());
        }

        [Authorize]
        [CheckIsLoginValid]
        [HttpGet]
        public IActionResult GetUserSettingsByWildcard(KeyRequestModel model)
        {
            if (string.IsNullOrEmpty(model.Key))
                return new JsonResult(KeysValuesResponseModel.CreateErrorResponse());

            (bool isOk, List<KeyValueResponseModel>? values) result = dbHandlerHyperLabUsers.getUserSettingsValuesByWildcard(getUserId(),
                                                                                                                             model.Key);

            if (result.isOk)
                return new JsonResult(new KeysValuesResponseModel() { Responses = result.values });
            else
                return new JsonResult(KeysValuesResponseModel.CreateErrorResponse());
        }
        #endregion

        #region POST
        [Authorize]
        [CheckIsLoginValid]
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
    }
}

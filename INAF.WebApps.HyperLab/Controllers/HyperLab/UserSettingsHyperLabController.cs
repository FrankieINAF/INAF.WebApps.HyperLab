using INAF.Libraries.Net.CommonWebAppModels.Models.Responses;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Responses;
using INAF.WebApps.HyperLab.Controllers.Base;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers.HyperLab
{
    public class UserSettingsHyperLabController : BaseController
    {
        private readonly DbHandlerHyperLabData dbHandlerHyperLabData;
        private readonly DbHandlerHyperLabUsers dbHandlerHyperLabUsers;

        public UserSettingsHyperLabController(IServiceProvider serviceProvider, 
                                              IConfiguration configuration, 
                                              ILogger<BaseController> logger,
                                              DbHandlerHyperLabData dbHandlerHyperLabData,
                                              DbHandlerHyperLabUsers dbHandlerHyperLabUsers) : base(serviceProvider, configuration, logger)
        {
            this.dbHandlerHyperLabData = dbHandlerHyperLabData;
            this.dbHandlerHyperLabUsers = dbHandlerHyperLabUsers;
        }

        [HttpGet]
        public IActionResult GetDefaultColors(bool searchForDefaults)
        {
            IEnumerable<KeyValueResponseModel> result = dbHandlerHyperLabUsers.getColors(getUserId(),
                                                                                         searchForDefaults);

            if (result.Any())
                return new JsonResult(new KeysValuesResponseModel() { Responses = result });
            else
                return new JsonResult(GenericValueStringResponseModel.CreateErrorResponse());
        }

        #region DEFAULT FIT SEGMENTS
        [HttpGet]
        public IActionResult GetFitFunctions()
        {
            var fitMethods = dbHandlerHyperLabData.readFitMethodModels();
            return new JsonResult(fitMethods);
        }
        #endregion

        #region PMIN-PMAX FIT
        [HttpGet]
        public IActionResult GetPXMinPXMaxMaxValueFunctions()
        {
            var fitMethods = dbHandlerHyperLabData.readPXMinPXMaxFitMethodModels();
            return new JsonResult(fitMethods);
        }
        #endregion
    }
}

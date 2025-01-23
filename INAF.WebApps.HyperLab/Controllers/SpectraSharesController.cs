using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Shares;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Responses;
using INAF.WebApps.HyperLab.Controllers.Base;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    public class SpectraSharesController : BaseController
    {
        private readonly DbHandlerHyperLabData dbHandlerHyperLabData;
        //private readonly DbHandlerHyperLabUsers dbHandlerHyperLabUsers;

        public SpectraSharesController(IServiceProvider serviceProvider, 
                                       IConfiguration configuration,
                                       DbHandlerHyperLabData dbHandlerHyperLabData,
                                       DbHandlerHyperLabUsers dbHandlerHyperLabUsers,
                                       ILogger<BaseController> logger) : base(serviceProvider, configuration, logger)
        {
            this.dbHandlerHyperLabData = dbHandlerHyperLabData;
            //this.dbHandlerHyperLabUsers = dbHandlerHyperLabUsers;
        }

        [HttpPost]
        public async Task<IActionResult> AddSharesBetweenOwnerUserAndUsers([FromBody] SpectraShareModel model)
        {
            if (await dbHandlerHyperLabData.upsertSharesBetweenOwnerUserAndUsersAsync(getUserId(), model.SpectraIds!, model.UsersToShare!))
                return new JsonResult(GenericResponseModel.CreateSuccessResponse());
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }

        //public IActionResult GetSharesForUser()
        //{
        //    var shares = dbHandlerHyperLabData.getSharesForUser(getUserId());
        //    if (shares != null && shares.Any())
        //        return new JsonResult(shares);
        //    else
        //        return new EmptyResult();
        //}

        //public IActionResult IsAnyShareAvailableForUser()
        //{
        //    if (dbHandlerHyperLabData.isAnyShareAvailableForUser(getUserId()))
        //        return new JsonResult(GenericResponseModel.CreateSuccessResponse());
        //    else
        //        return new JsonResult(GenericResponseModel.CreateErrorResponse());
        //}

        public async Task<IActionResult> JoinShare()
        {
            //if (await dbHandlerHyperLabData.joinAllSharesForUserAsync(getUserId()))
            //    return new JsonResult(GenericResponseModel.CreateSuccessResponse());
            //else>
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }
    }
}

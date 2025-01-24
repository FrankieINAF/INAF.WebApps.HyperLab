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
        private readonly DbHandlerHyperLabUsers dbHandlerHyperLabUsers;

        public SpectraSharesController(IServiceProvider serviceProvider,
                                       IConfiguration configuration,
                                       DbHandlerHyperLabData dbHandlerHyperLabData,
                                       DbHandlerHyperLabUsers dbHandlerHyperLabUsers,
                                       ILogger<BaseController> logger) : base(serviceProvider, configuration, logger)
        {
            this.dbHandlerHyperLabData = dbHandlerHyperLabData;
            this.dbHandlerHyperLabUsers = dbHandlerHyperLabUsers;
        }

        [HttpPost]
        public async Task<IActionResult> AddSharesBetweenOwnerUserAndUsers([FromBody] SpectraShareModel model)
        {
            if (model == null || model.SpectraIds == null || !model.SpectraIds.Any() || model.UsersToShare == null || !model.UsersToShare.Any())
                return new JsonResult(GenericResponseModel.CreateErrorResponse());

            List<ShareResultModel> results = await dbHandlerHyperLabData.upsertSharesBetweenOwnerUserAndUsersAsync(getUserId(), 
                                                                                                                   model.SpectraIds, 
                                                                                                                   model.UsersToShare);
            foreach (ShareResultModel result in results)
            {
                if (result.IsShareCreated)
                {
                    result.IsErrorInInvitation = !await dbHandlerHyperLabUsers.tryAddUserToBeInvited(result.Email);
                }
            }

            bool isAnyErrorInInvitations = results.Any(x => x.IsErrorInInvitation);
            bool isAnyErrorInShare = results.Any(x => !x.IsShareCreated);

            if (isAnyErrorInShare || isAnyErrorInInvitations) 
                return new JsonResult(new GenericResponseModel(false, results));

            return new JsonResult(GenericResponseModel.CreateSuccessResponse());
        }
    }
}

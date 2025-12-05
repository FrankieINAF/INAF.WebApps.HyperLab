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
        public async Task<IActionResult> AddSharesBetweenOwnerUserAndUsers([FromBody] AddShareModel model)
        {
            if (model == null || model.SpectraIds == null || !model.SpectraIds.Any() || model.UsersToShare == null || !model.UsersToShare.Any())
                return new JsonResult(GenericResponseModel.CreateErrorResponse());

            List<ShareResultAddModel> results = await dbHandlerHyperLabData.upsertSharesBetweenOwnerUserAndUsersAsync(getUserId(), 
                                                                                                                      model.SpectraIds, 
                                                                                                                      model.UsersToShare);
            foreach (ShareResultAddModel result in results)
            {
                if (result.IsShareOperationCompleted)
                    result.IsErrorInInvitation = !await dbHandlerHyperLabUsers.tryAddUserToBeInvited(result.Email!);
            }

            bool isAnyErrorInInvitations = results.Any(x => x.IsErrorInInvitation);
            bool isAnyErrorInShare = results.Any(x => !x.IsShareOperationCompleted);

            if (isAnyErrorInShare || isAnyErrorInInvitations) 
                return new JsonResult(new GenericResponseModel(false, results));

            return new JsonResult(GenericResponseModel.CreateSuccessResponse());
        }

        [HttpPost]
        public async Task<IActionResult> RemoveSharesBetweenOwnerUserAndUsers([FromBody] RemoveSharesContainer model)
        {
            if (model == null || model.Shares == null || !model.Shares.Any())
                return new JsonResult(GenericResponseModel.CreateErrorResponse());

            int operationUserId = getUserId();
            List<ShareResultRemoveModel> results = await dbHandlerHyperLabData.removeSharesBetweenOwnerUserAndUsersAsync(operationUserId,
                                                                                                                         model.Shares,
                                                                                                                         operationUserId);

            bool isAnyErrorInShare = results.Any(x => !x.IsShareOperationCompleted);
            if (isAnyErrorInShare)
            {
                var wrongSharesResults = results.Where(x => !x.IsShareOperationCompleted).ToList();
                foreach (ShareResultRemoveModel result in wrongSharesResults)
                {
                    if (string.IsNullOrEmpty(result.UserId))
                        continue;
                    var user = dbHandlerHyperLabUsers.getUserDetailsSimple(int.Parse(result.UserId));
                    if (user == null)
                        continue;
                    result.CompleteUserName = $"{user.Name} {user.LastName}";
                }
            }

            return new JsonResult(new GenericResponseModel(!isAnyErrorInShare, results));
        }

        [HttpPost]
        public async Task<IActionResult> SetSpectraAsPublic([FromBody] SetSpectraAsPublicModel model)
        {
            if (model == null || model.SpectraIds == null || !model.SpectraIds.Any())
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
            
            if (await dbHandlerHyperLabData.setSpectraAsPublicAsync(model.SpectraIds, getUserId()))
                return new JsonResult(GenericResponseModel.CreateSuccessResponse());
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }
    }
}

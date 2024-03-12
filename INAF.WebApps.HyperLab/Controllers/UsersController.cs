using INAF.Libraries.Net.CommonWebAppHelpers;
using INAF.Libraries.Net.CommonWebAppModels.Models.Account;
using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.CommonWebAppModels.Models.Users;
using INAF.Libraries.Net.SLabDbLibrary;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.WebApp.Permissions;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.WebApp.Responses;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.WebApp.Users;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Helpers.Factories;
using INAF.WebApps.HyperLab.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    [Authorize]
    [CheckIsLoginValid]
    public partial class UsersController : BaseController
    {
        private readonly IWebHostEnvironment webHostEnvironment;
        private readonly UsersFactory usersFactory;

        public UsersController(IServiceProvider serviceProvider,
                               IConfiguration configuration,
                               IWebHostEnvironment webHostEnvironment,
                               DbHandler dbHandler,
                               ILogger<BaseController> logger) : base(serviceProvider, configuration, dbHandler, logger)
        {
            this.webHostEnvironment = webHostEnvironment;
            usersFactory = serviceProvider.GetRequiredService<UsersFactory>();
        }

        #region VIEWS
        [HttpGet]
        public IActionResult GetUserDetailsView(GenericRequestByIdModel model)
        {
            var userModel = dbHandler.getUserDetails(model.Id);
            if (userModel != null)
                return PartialView("Partials/_UserDetails", userModel);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult UpsertUser()
        {
            return PartialView(usersFactory.createUserForInsert());
        }

        [HttpGet]
        public IActionResult UsersList(WebBaseModel statusResponseModel = null)
        {
            if (statusResponseModel == null)
                statusResponseModel = getOkStatusResponseModel();
            return PartialView(statusResponseModel);
        }
        #endregion

        #region GET
        [HttpGet]
        public IActionResult GetUserDetailsSimple()
        {
            UserSimpleModel user = dbHandler.getUserDetailsSimple(getUserId());
            if (user != null)
                return new JsonResult(user);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult GetUserPermissions()
        {
            List<PermissionModel> permissions = dbHandler.getUserPermissions(getUserId());
            if (permissions?.Count > 0)
                return new JsonResult(permissions);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult GetUsersList()
        {
            var users = dbHandler.getUsers();
            if (users.Any())
                return new JsonResult(users);
            else
                return new EmptyResult();
        }
        #endregion

        #region POST    
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteUser([FromBody] GenericRequestByIdModel model)
        {
            int operationUserId = getUserId();
            if (model.Id == operationUserId)
            {
                return new BadRequestObjectResult(new GenericValueStringResponseModel() { IsOk = false, ExMsg = Resources.Users.SelfDeletingErrorMessage });
            }
            else
            {
                bool isOk = await dbHandler.deleteUserAsync(model.Id,
                                                            operationUserId);
                return new JsonResult(new GenericValueStringResponseModel() { IsOk = isOk });
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult EditUser([FromForm] GenericRequestByIdModel model)
        {
            var usersFactory = serviceProvider.GetRequiredService<UsersFactory>();
            return PartialView("UpsertUser", usersFactory.getUserForUpdate(model.Id));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpsertUser([FromForm] UserModel model)
        {
            clearErrorsForKey($"{nameof(model.Contacts)}[0].{nameof(ContactModel.Name)}");
            if (model.OperationType == Libraries.Net.CommonWebAppModels.Values.Enums.OperationType.Update)
            {
                clearErrorsForKey($"{nameof(model.Login)}.{nameof(LoginModel.Password)}");
                clearErrorsForKey($"{nameof(model.Login)}.{nameof(LoginModel.ConfirmPassword)}");
            }

            if (ModelState.IsValid)
            {
                var email = model.Contacts.FirstOrDefault(x => x.ContactType == Libraries.NetStandard.HyperLabCommonModels.Values.Enums.ContactType.Email);

                if (await dbHandler.upsertUserProcedureAsync(model.Id,
                                                             model.Name,
                                                             model.LastName,
                                                             model.Login.UserName,
                                                             getEncrypted(model.Login.Password),
                                                             model.RoleId,
                                                             email.Value,
                                                             HttpContext.GetUserId()))
                {
                    return new OkObjectResult(getOkStatusResponseModel());
                }
            }

            logErrorMessage(ModelState.Values);
            var modelForError = usersFactory.createUserForInsert();
            modelForError.ErrorMessage = Resources.Users.UpsertUserModelStateNotValidMessage;
            return PartialView(modelForError);
        }
        #endregion

        #region checks
        [HttpPost]
        public IActionResult CheckIsUserAllowed([FromBody] CheckIsUserExistantModel model)
        {
            /* avoid raising issue when person is in edit mode */
            try
            {
                string[] fields = new[] { model.Name, model.NameForCheck, model.LastName, model.LastNameForCheck, model.Email, model.EmailForCheck };
                (bool isEditMode, string exMsg) isRemoteCheckInEditModeResult = isRemoteCheckInEditMode(fields);
                if (isRemoteCheckInEditModeResult.isEditMode)
                    return Json(true);
            }
            catch (Exception)
            {
                logger.LogError(Resources.Users.CheckIsUserExistantErrorMessage);
                return new BadRequestObjectResult(Resources.Users.CheckIsUserExistantErrorMessage);
            }

            if (!dbHandler.isUserExistant(model.Name, model.LastName, model.Email))
                return Json(true);
            else
                return Json(false);
        }
        #endregion
    }
}

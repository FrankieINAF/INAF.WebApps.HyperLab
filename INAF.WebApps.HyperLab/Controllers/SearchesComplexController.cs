using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.CommonWebAppModels.Models.Responses;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.Extensions;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Searches;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.SearchesManagement;
using INAF.Libraries.Net.HyperLab.CommonModels.Values;
using INAF.WebApps.HyperLab.Attributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    [Authorize]
    [IsLoginValid]
    public partial class SearchesComplexController : SearchesBaseController
    {
        public SearchesComplexController(IServiceProvider serviceProvider,
                                  ILogger<SpectraManagerController> logger,
                                  DbHandlerHyperLabData dbHandlerHyperLabData) : base(serviceProvider, dbHandlerHyperLabData, logger)
        { }

        #region SEARCH COMPLEX
        [HttpPost]
        public async Task<IActionResult> SearchComplexById([FromBody] GenericRequestByIdModel model,
                                                           bool saveSessionVariable = true)
        {
            ComplexSearchSavingModel? complexSearchModel = dbHandlerHyperLabData.getSavedComplexSearch(model.Id,
                                                                                                       await getUserIdAsync());
            if (complexSearchModel == null || complexSearchModel.Conditions == null || !complexSearchModel.Conditions.Any())
                return new EmptyResult();

            List<SpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchComplex(complexSearchModel.Conditions,
                                                                                                complexSearchModel.RequestedLevels!,
                                                                                                await getUserIdAsync());

            if (saveSessionVariable)
                setLastSearchSession(model, Enums.SearchType.Complex);

            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("~/Views/Searches/Partials/_SearchResults.cshtml", new SearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return new JsonResult(await retrieveSpectraFilesForGroupsAsync(spectraFilesInfo, complexSearchModel.RequestedLevels!));
            }

            return new EmptyResult();
        }

        [HttpPost]
        public async Task<IActionResult> SearchComplexByModel([FromBody] ComplexSearchSavingModel complexSearchModel,
                                                              bool saveSessionVariable = true)
        {
            if (complexSearchModel == null || !complexSearchModel.Conditions.IsAny() || !complexSearchModel.RequestedLevels.IsAny())
                return new EmptyResult();

            List<SpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchComplex(complexSearchModel.Conditions!,
                                                                                                complexSearchModel.RequestedLevels!,
                                                                                                await getUserIdAsync());

            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("~/Views/Searches/Partials/_SearchResults.cshtml", new SearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return new JsonResult(await retrieveSpectraFilesForGroupsAsync(spectraFilesInfo, complexSearchModel.RequestedLevels!));
            }

            return new EmptyResult();
        }
        #endregion

        #region COMPLEX SEARCHES MANAGEMENT
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteComplexSearch([FromBody] GenericRequestByIdModel model)
        {
            bool isOk = await dbHandlerHyperLabData.deleteComplexSearchAsync(model.Id,
                                                                             await getUserIdAsync());
            return new JsonResult(new GenericResponseModel() { IsOk = isOk });
        }

        [HttpPost]
        public async Task<IActionResult> DeleteComplexSearchForJwt([FromBody] GenericRequestByIdModel model)
        {
            bool isOk = await dbHandlerHyperLabData.deleteComplexSearchAsync(model.Id,
                                                                             await getUserIdAsync());
            return new JsonResult(new GenericResponseModel() { IsOk = isOk });
        }

        [HttpGet]
        public async Task<IActionResult> GetSavedComplexSearchInfo(GenericRequestByIdModel model)
        {
            ComplexSearchDetailedInfoModel? result = dbHandlerHyperLabData.getSavedComplexSearchInfo(model.Id,
                                                                                                     await getUserIdAsync());
            return new JsonResult(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetSavedComplexSearches()
        {
            IEnumerable<ComplexSearchGeneralInfoModel>? savedSearches = dbHandlerHyperLabData.getSavedComplexSearches(await getUserIdAsync());
            return new JsonResult(savedSearches);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SaveComplexSearch(ComplexSearchSavingModel model)
        {
            GenericValueStringResponseModel? result = await saveComplexSearchAsync(model);
            return new JsonResult(result);
        }

        [HttpGet]
        public async Task<IActionResult> IsComplexSearchNameAvailable(GenericRequestByTextModel model)
        {
            bool isAvailable = dbHandlerHyperLabData.isComplexSearchNameAvailable(model.Text, await getUserIdAsync());
            return new JsonResult(new GenericResponseModel() { IsOk = isAvailable });
        }

        [HttpPost]
        public async Task<IActionResult> SaveComplexSearchForJwt([FromBody] ComplexSearchSavingModel model)
        {
            GenericValueStringResponseModel? result = await saveComplexSearchAsync(model);
            return new JsonResult(result);
        }

        private async Task<GenericValueStringResponseModel?> saveComplexSearchAsync(ComplexSearchSavingModel model)
        {
            GenericValueStringResponseModel? result = null;

            var errorResult = new GenericValueStringResponseModel() { IsOk = false, ExMsg = Resources.Search.SaveComplexSearchErrorMessage };

            if (ModelState.IsValid)
            {
                if (string.IsNullOrEmpty(model.Name) ||
                    model.RequestedLevels == null || !model.RequestedLevels.Any() ||
                    model.Conditions == null)
                    return errorResult;

                var saveSearchResult = await dbHandlerHyperLabData.saveComplexSearchAsync((int)model.Id,
                                                                                          model.Name,
                                                                                          model.RequestedLevels,
                                                                                          model.Conditions,
                                                                                          await getUserIdAsync());

                switch (saveSearchResult.queryResult)
                {
                    case Enums.QueryResult.Ok:
                        result = new GenericValueStringResponseModel() { IsOk = true, Id = saveSearchResult.id };
                        break;
                    case Enums.QueryResult.AlreadyExistingItem:
                        result = new GenericValueStringResponseModel() { IsOk = false, ExMsg = Resources.Search.SaveComplexSearchAlreadyExistingMessage };
                        break;
                    case Enums.QueryResult.Error:
                    case Enums.QueryResult.ErrorOnInsert:
                    case Enums.QueryResult.ErrorOnCommit:
                        result = errorResult;
                        break;
                    default:
                        break;
                }
            }
            else
            {
                result = errorResult;
            }

            return result;
        }
        #endregion
    }
}

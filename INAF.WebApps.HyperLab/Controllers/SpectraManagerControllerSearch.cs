using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.Extensions;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Searches;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.SearchesManagement;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Requests;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Responses;
using INAF.Libraries.Net.HyperLab.CommonModels.Values;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Helpers;
using INAF.WebApps.HyperLab.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using static INAF.Libraries.Net.HyperLab.CommonModels.Values.Enums;

namespace INAF.WebApps.HyperLab.Controllers
{
    [Authorize]
    [CheckIsLoginValid]
    public partial class SpectraManagerController
    {
        #region SEARCH COMPLEX
        [HttpGet]
        public IActionResult SearchComplexById(GenericRequestByIdModel model,
                                               bool saveSessionVariable = true)
        {
            ComplexSearchSavingModel? complexSearchModel = dbHandlerHyperLabData.getSavedComplexSearch(model.Id,
                                                                                                       getUserId());
            if (complexSearchModel == null || complexSearchModel.Conditions == null || !complexSearchModel.Conditions.Any())
                return new EmptyResult();

            List<SpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchComplex(complexSearchModel.Conditions,
                                                                                                complexSearchModel.RequestedLevels!,
                                                                                                getUserId());

            if (saveSessionVariable)
                setLastSearchSession(model, Enums.SearchType.Complex);

            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("Partials/_SearchResults", new SearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo, complexSearchModel.RequestedLevels!));
            }

            return new EmptyResult();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult SearchComplexByModel(ComplexSearchSavingModel complexSearchModel,
                                                  bool saveSessionVariable = true)
        {
            if (complexSearchModel == null || !complexSearchModel.Conditions.IsAny())
                return new EmptyResult();

            List<SpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchComplex(complexSearchModel.Conditions!,
                                                                                                complexSearchModel.RequestedLevels!,
                                                                                                getUserId());

            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("Partials/_SearchResults", new SearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo, complexSearchModel.RequestedLevels!));
            }

            return new EmptyResult();
        }
        #endregion

        #region SEARCH SIMPLE
        [HttpPost]
        public IActionResult SearchSimpleGroupsByFilename([FromBody] SearchRequestByTextModel model,
                                                          bool saveSessionVariable = true)
        {
            if (model == null || !isRequestOkByText(model.Text, model.RequestedLevels))
                return new EmptyResult();

            IEnumerable<SpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchSimpleGroupsByFilename(model.Text!,
                                                                                                                      model.RequestedLevels!,
                                                                                                                      getUserId());

            if (saveSessionVariable)
                setLastSearchSession(model, Enums.SearchType.SimpleByFilename);

            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("Partials/_SearchResults", new SearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo, model.RequestedLevels!));
            }

            return new EmptyResult();
        }

        [HttpPost]
        public IActionResult SearchSimpleGroupsByMaterial([FromBody] SearchRequestByParametersModel model,
                                                          bool saveSessionVariable = true)
        {
            if (model == null || !isRequestOkById(model.Id, model.RequestedLevels))
                return new EmptyResult();

            var searchByMaterialHelper = serviceProvider.GetRequiredService<SearchByMaterialHelper>();
            IEnumerable<SpectraGroupInfoModel>? spectraFilesInfo = searchByMaterialHelper.searchByMaterial(model.Id,
                                                                                                           model.Type!,
                                                                                                           model.RequestedLevels!,
                                                                                                           getUserId());

            if (saveSessionVariable)
                setLastSearchSession(model, Enums.SearchType.SimpleByMaterial);

            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("Partials/_SearchResults", new SearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo, model.RequestedLevels!));
            }

            return new EmptyResult();
        }

        [HttpPost]
        public IActionResult SearchSimpleGroupsByMineralType([FromBody] SearchRequestByIdModel model,
                                                             bool saveSessionVariable = true)
        {
            if (model == null || !isRequestOkById(model.Id, model.RequestedLevels))
                return new EmptyResult();

            IEnumerable<SpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchSimpleGroupsByMineralType(model.Id,
                                                                                                                         model.RequestedLevels!,
                                                                                                                         getUserId());

            if (saveSessionVariable)
                setLastSearchSession(model, Enums.SearchType.SimpleByMineralType);

            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("Partials/_SearchResults", new SearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo, model.RequestedLevels!));
            }

            return new EmptyResult();
        }

        [HttpPost]
        public IActionResult SearchSimpleGroupsByOriginType([FromBody] SearchRequestByIdModel model,
                                                            bool saveSessionVariable = true)
        {
            if (model == null || !isRequestOkById(model.Id, model.RequestedLevels))
                return new EmptyResult();

            IEnumerable<SpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchSimpleGroupsByOriginType(model.Id,
                                                                                                                        model.RequestedLevels!,
                                                                                                                        getUserId());

            if (saveSessionVariable)
                setLastSearchSession(model, Enums.SearchType.SimpleByOriginType);

            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("Partials/_SearchResults", new SearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo, model.RequestedLevels!));
            }

            return new EmptyResult();
        }

        [HttpPost]
        public IActionResult SearchSimpleGroupsBySampleName([FromBody] SearchRequestByTextModel model,
                                                            bool saveSessionVariable = true)
        {
            if (model == null || !isRequestOkByText(model.Text, model.RequestedLevels))
                return new EmptyResult();

            IEnumerable<SpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchSimpleGroupsBySampleName(model.Text!,
                                                                                                                        model.RequestedLevels!,
                                                                                                                        getUserId());

            if (saveSessionVariable)
                setLastSearchSession(model, Enums.SearchType.SimpleBySampleName);

            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("Partials/_SearchResults", new SearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo, model.RequestedLevels!));
            }

            return new EmptyResult();
        }

        [HttpPost]
        public IActionResult SearchSimpleGroupsBySampleType([FromBody] SearchRequestByIdModel model,
                                                            bool saveSessionVariable = true)
        {
            if (model == null || !isRequestOkById(model.Id, model.RequestedLevels))
                return new EmptyResult();

            IEnumerable<SpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchSimpleGroupsBySampleType(model.Id,
                                                                                                                        model.RequestedLevels!,
                                                                                                                        getUserId());

            if (saveSessionVariable)
                setLastSearchSession(model, Enums.SearchType.SimpleBySampleType);

            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("Partials/_SearchResults", new SearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(spectraFilesInfo);
            }

            return new EmptyResult();
        }
        #endregion

        #region DETAILS
        [HttpGet]
        public IActionResult SearchGroupItems(GenericRequestByIdModel model)
        {
            List<SpectrumInfoModel>? spectrumInfoModels = dbHandlerHyperLabData.searchGroupItems(model.Id,
                                                                                                 getUserId());
            if (spectrumInfoModels?.Count > 0)
                return new JsonResult(spectrumInfoModels);
            else
                return new JsonResult(null);
        }
        #endregion

        #region SUGGESTIONS
        [HttpGet]
        public IActionResult GetSampleNameSuggestions(GenericRequestByTextModel model)
        {
            if (string.IsNullOrEmpty(model.Text) || model.Text.Length < 3)
                return new EmptyResult();

            List<string>? sampleNames = dbHandlerHyperLabData.getSampleNameSuggestions(model.Text,
                                                                                       getUserId());
            if (sampleNames?.Count > 0)
                return new JsonResult(sampleNames);
            else
                return new EmptyResult();
        }
        #endregion

        #region COMPLEX SEARCHES MANAGEMENT
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteComplexSearch([FromBody] GenericRequestByIdModel model)
        {
            bool isOk = await dbHandlerHyperLabData.deleteComplexSearchAsync(model.Id,
                                                                             getUserId());
            return new JsonResult(new GenericResponseModel() { IsOk = isOk });
        }

        [HttpPost]
        public async Task<IActionResult> DeleteComplexSearchForJwt([FromBody] GenericRequestByIdModel model)
        {
            bool isOk = await dbHandlerHyperLabData.deleteComplexSearchAsync(model.Id,
                                                                             getUserId());
            return new JsonResult(new GenericResponseModel() { IsOk = isOk });
        }

        [HttpGet]
        public IActionResult GetSavedComplexSearchInfo(GenericRequestByIdModel model)
        {
            ComplexSearchDetailedInfoModel? result = dbHandlerHyperLabData.getSavedComplexSearchInfo(model.Id,
                                                                                                     getUserId());
            return new JsonResult(result);
        }

        [HttpGet]
        public IActionResult GetSavedComplexSearches()
        {
            IEnumerable<ComplexSearchGeneralInfoModel>? savedSearches = dbHandlerHyperLabData.getSavedComplexSearches(getUserId());
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
        public IActionResult IsComplexSearchNameAvailable(GenericRequestByTextModel model)
        {
            bool isAvailable = dbHandlerHyperLabData.isComplexSearchNameAvailable(model.Text, getUserId());
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
                                                                                          getUserId());

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

        #region private
        private bool isRequestOkById(int id,
                                     List<int>? requestedLevels)
        {
            if (id < 1 ||
                requestedLevels == null ||
                !requestedLevels.Any())
                return false;

            return true;
        }

        private bool isRequestOkByText(string? text,
                                       List<int>? requestedLevels)
        {
            if (string.IsNullOrEmpty(text) ||
                text.Length < 3 ||
                requestedLevels == null ||
                !requestedLevels.Any())
                return false;

            return true;
        }

        private void setLastSearchSession(object json,
                                          SearchType searchType)
        {
            if (HttpContext.Session.ContainsKey(Values.Constants.LAST_SEARCH))
                HttpContext.Session.Remove(Values.Constants.LAST_SEARCH);

            HttpContext.Session.SetObject(Values.Constants.LAST_SEARCH, new SessionSearchModel() { SearchObjectJson = json, SearchType = searchType });
        }
        #endregion
    }
}

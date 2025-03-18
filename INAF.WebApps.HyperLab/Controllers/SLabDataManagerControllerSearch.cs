using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.CommonWebAppModels.Models.Searches.Interfaces;
using INAF.Libraries.Net.CommonWebAppModels.Models.Searches;
using INAF.Libraries.Net.CommonWebAppModels.Models.SpectraFiles;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Searches;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Responses;
using INAF.WebApps.HyperLab.Helpers;
using Microsoft.AspNetCore.Mvc;
using INAF.Libraries.Net.HyperLab.CommonModels.Values;

namespace INAF.WebApps.HyperLab.Controllers
{
    public partial class SLabDataManagerController
    {
        #region SEARCH COMPLEX
        [HttpGet]
        public IActionResult SearchComplex(GenericRequestByIdModel model)
        {
            ComplexSearchSavingModel? complexSearchModel = dbHandlerHyperLabData.getSavedComplexSearch(model.Id,
                                                                                                       getUserId());
            if (complexSearchModel == null || complexSearchModel.Conditions == null || !complexSearchModel.Conditions.Any())
                return new EmptyResult();

            List<SpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchComplex(complexSearchModel.Conditions,
                                                                                                getUserId());

            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("Partials/_SearchResults", new SearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo));
            }

            return new EmptyResult();
        }
        #endregion

        #region SEARCH SIMPLE
        [HttpPost]
        public IActionResult SearchSimpleGroupsByFilename(SearchRequestByTextModel model)
        {
            if (string.IsNullOrEmpty(model.Text) || 
                model.Text.Length < 3 || 
                model.RequestedLevels == null || 
                !model.RequestedLevels.Any())
                return new EmptyResult();

            IEnumerable<SpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchSimpleGroupsByFilename(model.Text,
                                                                                                                      model.RequestedLevels,
                                                                                                                      getUserId());
            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("Partials/_SearchResults", new SearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo));
            }

            return new EmptyResult();
        }

        [HttpPost]
        public IActionResult SearchSimpleGroupsByMaterial(SearchRequestByParametersModel model)
        {
            if (model.Type == null ||
                model.RequestedLevels == null ||
                !model.RequestedLevels.Any())
                return new EmptyResult();

            var searchByMaterialHelper = serviceProvider.GetRequiredService<SearchByMaterialHelper>();
            IEnumerable<SpectraGroupInfoModel>? spectraFilesInfo = searchByMaterialHelper.searchByMaterial(model.Id,
                                                                                                           model.Type,
                                                                                                           model.RequestedLevels,
                                                                                                           getUserId());

            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("Partials/_SearchResults", new SearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo));
            }

            return new EmptyResult();
        }

        [HttpPost]
        public IActionResult SearchSimpleGroupsByMineralType(SearchRequestByIdModel model)
        {
            if (model.RequestedLevels == null ||
                !model.RequestedLevels.Any())
                return new EmptyResult();

            IEnumerable<SpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchSimpleGroupsByMineralType(model.Id,
                                                                                                                         model.RequestedLevels,
                                                                                                                         getUserId());
            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("Partials/_SearchResults", new SearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo));
            }

            return new EmptyResult();
        }

        [HttpPost]
        public IActionResult SearchSimpleGroupsByOriginType(SearchRequestByIdModel model)
        {
            if (model.RequestedLevels == null ||
                !model.RequestedLevels.Any())
                return new EmptyResult();

            IEnumerable<SpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchSimpleGroupsByOriginType(model.Id,
                                                                                                                        model.RequestedLevels,
                                                                                                                        getUserId());
            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("Partials/_SearchResults", new SearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo));
            }

            return new EmptyResult();
        }

        [HttpPost]
        public IActionResult SearchSimpleGroupsBySampleName(SearchRequestByTextModel model)
        {
            if (string.IsNullOrEmpty(model.Text) ||
                model.Text.Length < 3 ||
                model.RequestedLevels == null ||
                !model.RequestedLevels.Any())
                return new EmptyResult();

            IEnumerable<SpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchSimpleGroupsBySampleName(model.Text,
                                                                                                                        model.RequestedLevels,
                                                                                                                        getUserId());
            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("Partials/_SearchResults", new SearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo));
            }

            return new EmptyResult();
        }

        [HttpPost]
        public IActionResult SearchSimpleGroupsBySampleType(SearchRequestByIdModel model)
        {
            if (model.RequestedLevels == null ||
                !model.RequestedLevels.Any())
                return new EmptyResult();

            IEnumerable<SpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchSimpleGroupsBySampleType(model.Id,
                                                                                                                        model.RequestedLevels,
                                                                                                                        getUserId());
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
            if (model.Text.Length < 3)
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

        //[HttpGet]
        //public IActionResult GetSavedComplexSearch(GenericRequestByIdModel model)
        //{
        //    ComplexSearchSavingModel? complexSearchModel = dbHandlerHyperLabData.getSavedComplexSearch(model.Id,
        //                                                                                               getUserId());
        //    if (complexSearchModel == null || complexSearchModel.Conditions == null || !complexSearchModel.Conditions.Any())
        //        return new EmptyResult();

        //    return new JsonResult(complexSearchModel);
        //}

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
    }
}

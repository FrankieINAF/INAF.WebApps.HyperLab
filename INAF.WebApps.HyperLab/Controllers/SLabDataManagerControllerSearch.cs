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
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult SearchComplex(ComplexSearchModel model)
        {
            if (model.Conditions == null)
                return new EmptyResult();

            List<ISpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchComplex(model.Conditions,
                                                                                                 getUserId());
            return PartialView("Partials/_SearchResults", new SimpleSearchResultsContainer(spectraFilesInfo));
        }
        #endregion

        #region SEARCH SIMPLE
        [HttpGet]
        public IActionResult SearchSimpleGroupsByMaterial(GenericRequestByParametersModel model)
        {
            if (model.Type == null)
                return new EmptyResult();

            var searchByMaterialHelper = serviceProvider.GetRequiredService<SearchByMaterialHelper>();
            IEnumerable<ISpectraGroupInfoModel>? spectraFilesInfo = searchByMaterialHelper.searchByMaterial(model.Id,
                                                                                                            model.Type,
                                                                                                            getUserId());

            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("Partials/_SearchResults", new SimpleSearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo));
            }

            return new EmptyResult();
        }

        [HttpGet]
        public IActionResult SearchSimpleGroupsByMineralType(GenericRequestByIdModel model)
        {
            IEnumerable<ISpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchSimpleGroupsByMineralType(model.Id,
                                                                                                                          getUserId());
            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("Partials/_SearchResults", new SimpleSearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo));
            }

            return new EmptyResult();
        }

        [HttpGet]
        public IActionResult SearchSimpleGroupsByOriginType(GenericRequestByIdModel model)
        {
            IEnumerable<ISpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchSimpleGroupsByOriginType(model.Id,
                                                                                                                         getUserId());
            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("Partials/_SearchResults", new SimpleSearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo));
            }

            return new EmptyResult();
        }

        [HttpGet]
        public IActionResult SearchSimpleGroupsBySampleName(GenericRequestByTextModel model)
        {
            IEnumerable<ISpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchSimpleGroupsBySampleName(model.Text,
                                                                                                                         getUserId());
            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("Partials/_SearchResults", new SimpleSearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo));
            }

            return new EmptyResult();
        }

        [HttpGet]
        public IActionResult SearchSimpleGroupsBySampleType(GenericRequestByIdModel model)
        {
            IEnumerable<ISpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchSimpleGroupsBySampleType(model.Id,
                                                                                                                         getUserId());
            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("Partials/_SearchResults", new SimpleSearchResultsContainer(spectraFilesInfo));

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

        #region SEARCHES MANAGEMENT
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteComplexSearch([FromBody] GenericRequestByIdModel model)
        {
            bool isOk = await dbHandlerHyperLabData.deleteComplexSearchAsync(model.Id,
                                                                 getUserId());
            return new JsonResult(new GenericResponseModel() { IsOk = isOk });
        }

        [HttpGet]
        public IActionResult GetSavedComplexSearches()
        {
            IEnumerable<ComplexSearchGeneralInfoModel>? savedSearches = dbHandlerHyperLabData.getSavedComplexSearches(getUserId());
            return new JsonResult(savedSearches);
        }

        [HttpGet]
        public IActionResult GetSavedComplexSearchInfo(GenericRequestByIdModel model)
        {
            ComplexSearchDetailedInfoModel? result = dbHandlerHyperLabData.getSavedComplexSearchInfo(model.Id,
                                                                                         getUserId());
            return new JsonResult(result);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SaveComplexSearch(ComplexSearchSavingModel model)
        {
            GenericValueStringResponseModel? result = null;

            var errorResult = new GenericValueStringResponseModel() { IsOk = false, ExMsg = Resources.Search.SaveComplexSearchErrorMessage };

            if (ModelState.IsValid)
            {
                if (string.IsNullOrEmpty(model.Name) || model.Conditions == null)
                    return new JsonResult(errorResult);

                var saveSearchResult = await dbHandlerHyperLabData.saveComplexSearchAsync((int)model.Id,
                                                                                          model.Name,
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

            return new JsonResult(result);
        }
        #endregion
    }
}

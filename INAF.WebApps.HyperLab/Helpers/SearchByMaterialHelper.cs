using HtmlAgilityPack;
using INAF.Libraries.Net.CommonWebAppModels.Models.Searches.Interfaces;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.HyperLab.CommonModels.Extensions;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.SampleData;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.SampleData.Containers;
using static INAF.Libraries.Net.HyperLab.CommonModels.Values.Enums;

namespace INAF.WebApps.HyperLab.Helpers
{
    public sealed class SearchByMaterialHelper
    {
        private readonly IConfiguration configuration;
        private readonly DbHandlerHyperLabData dbHandlerSLabData;
        private readonly ILogger<SearchByMaterialHelper> logger;

        public SearchByMaterialHelper(IConfiguration configuration,
                                      DbHandlerHyperLabData dbHandlerSLabData,
                                      ILogger<SearchByMaterialHelper> logger)
        {
            this.configuration = configuration;
            this.dbHandlerSLabData = dbHandlerSLabData;
            this.logger = logger;
        }

        public List<ISpectraGroupInfoModel>? searchByMaterial(int id,
                                                              string type,
                                                              int operationUserId)
        {
            List<ISpectraGroupInfoModel>? spectraGroupInfoModels = null;

            MaterialType mineralType = type.ToMaterialType();

            switch (mineralType)
            {
                case MaterialType.MeteorClass:

                    break;

                case MaterialType.Mineral:
                    spectraGroupInfoModels = dbHandlerSLabData.searchSimpleGroupsByMineral(id,
                                                                                   operationUserId);
                    break;

                case MaterialType.Rock:
                    spectraGroupInfoModels = dbHandlerSLabData.searchSimpleGroupsByRock(id,
                                                                                operationUserId);
                    break;
            }

            return spectraGroupInfoModels;
        }

        #region meteor classes
        public async Task<MaterialsContainer> getMeteorClassesAsync(string text)
        {
            List<MaterialBaseModel>? values = null;

            try
            {
                /* create request model for retrieving suggestions for current text */
                var parameters = new Dictionary<string, string> {
                    { "categ", "All" },
                    { "data", text },
                    { "falls", "no" },
                    { "noants", "no" },
                    { "rect", "no" },
                    { "sfor", "types" } ,
                    { "stype", "starts" } ,
                };

                var encodedContent = new FormUrlEncodedContent(parameters);

                /* retrieve url for querying web service */
                var url = configuration.GetSection("AppSettings:ExternalServices:lpiusra").Value;

                /* send request to web service */
                using (var httpClient = new HttpClient())
                {
                    using (var response = await httpClient.PostAsync(new Uri(url), encodedContent))
                    {
                        if (response.IsSuccessStatusCode)
                        {
                            string responseContent = await response.Content.ReadAsStringAsync();
                            System.Diagnostics.Debug.WriteLine($"responseContent: {responseContent}");

                            if (!string.IsNullOrEmpty(responseContent))
                                values = processResponse(responseContent);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError($"{nameof(getMeteorClassesAsync)} - ex: {ex.Message}");
            }

            if (values != null )
            {
                return new MaterialsContainer()
                {
                    Materials = values,
                };
            }
            else
            {
                return new MaterialsContainer()
                {
                    ExMsg = Resources.Search.MeteorClassesSuggestionsErrorMessage
                };
            }
        }

        private List<MaterialBaseModel> processResponse(string responseContent)
        {
            List<MaterialBaseModel> values = new List<MaterialBaseModel>();

            try
            {
                HtmlDocument document = new HtmlDocument();
                document.LoadHtml(responseContent);
                var nodes = document.DocumentNode.SelectNodes("//li");
                if (nodes?.Count > 0)
                {
                    foreach (var node in nodes)
                    {
                        System.Diagnostics.Debug.WriteLine(node.InnerText);
                        values.Add(new MaterialBaseModel()
                        {
                            Id = 0,
                            Name = node.InnerText
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError($"{nameof(processResponse)} - ex: {ex.Message}");
            }

            return values;
        }
        #endregion
    }
}

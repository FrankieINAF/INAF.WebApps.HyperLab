using INAF.Libraries.Net.CommonWebAppModels.Models.DbValues;
using INAF.Libraries.Net.SLabDbLibrary;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.SampleData;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Extensions;

namespace INAF.WebApps.HyperLab.Helpers
{
    public sealed class SampleTypesHelper
    {
        private readonly DbHandler dbHandler;

        public SampleTypesHelper(DbHandler dbHandler)
        {
            this.dbHandler = dbHandler;
        }

        public SampleDataAvailableValues getSampleTypeValuesContainer()
        {
            IEnumerable<DbStringValue> sampleTypeValues = dbHandler.getSampleTypeValues();

            List<DbIntDoubleValue> sampleTypeGrainSizeValues = dbHandler.getSampleTypeGrainSizeValues();

            List<DbStringValue> sampleTypeGrainSizeTypeValues = dbHandler.getSampleTypeGrainSizeTypeValues();

            List<DbStringValue> originTypeValues = dbHandler.getOriginTypeValues();

            List<MineralTypeModel> mineralTypeValues = dbHandler.getMineralTypeValues();

            List<SampleTypeModel> sampleDataValues = new List<SampleTypeModel>(sampleTypeValues.Count());
            foreach (var sampleTypeValue in sampleTypeValues)
            {
                var sampleDataValue = new SampleTypeModel()
                {
                    Id = sampleTypeValue.Id,
                    Value = sampleTypeValue.StringValue,
                    GrainSizeValues = sampleTypeGrainSizeValues
                                        .Where(x => x.RefId == sampleTypeValue.Id)
                                        .Select(x => new GrainSizeModel() { Id = x.Id, Value = x.DoubleValue })
                                        .ToList()
                };
                sampleDataValues.Add(sampleDataValue);
            }

            return new SampleDataAvailableValues()
            {
                SampleDataValues = sampleDataValues,

                GrainSizeTypeValues = sampleTypeGrainSizeTypeValues
                                        .Select(x => new GrainSizeTypeModel() { Id = x.Id, Type = x.StringValue, TypeValue = x.StringValue.ToGrainSizeType() })
                                        .ToList(),

                OriginTypeValues = originTypeValues
                                    .Select(x => new OriginTypeModel() { Id = x.Id, Value = x.StringValue })
                                    .ToList(),

                MineralTypeValues = mineralTypeValues
            };
        }
    }
}

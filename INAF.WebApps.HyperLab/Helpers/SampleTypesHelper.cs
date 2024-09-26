using INAF.Libraries.DB.Net.SLabData.Models.DbValues;
using INAF.Libraries.Net.DB.SLabData;
using INAF.Libraries.Net.HyperLabCommonModels.Models.SampleData;
using INAF.Libraries.Net.HyperLabCommonModels.Extensions;

namespace INAF.WebApps.HyperLab.Helpers
{
    public sealed class SampleTypesHelper
    {
        private readonly DbHandlerSLabData dbHandlerSLabData;

        public SampleTypesHelper(DbHandlerSLabData dbHandlerSLabData)
        {
            this.dbHandlerSLabData = dbHandlerSLabData;
        }

        public SampleDataAvailableValues getSampleTypeValuesContainer()
        {
            IEnumerable<DbStringValue> sampleTypeValues = dbHandlerSLabData.getSampleTypeValues();

            List<DbIntDoubleValue> sampleTypeGrainSizeValues = dbHandlerSLabData.getSampleTypeGrainSizeValues();

            List<DbStringValue> sampleTypeGrainSizeTypeValues = dbHandlerSLabData.getSampleTypeGrainSizeTypeValues();

            List<DbStringValue> originTypeValues = dbHandlerSLabData.getOriginTypeValues();

            List<MineralTypeModel> mineralTypeValues = dbHandlerSLabData.getMineralTypeValues();

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

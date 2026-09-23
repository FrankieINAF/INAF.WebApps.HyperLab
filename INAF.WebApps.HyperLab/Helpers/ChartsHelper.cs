using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.Extensions;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Searches;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Spectrum;
using INAF.Libraries.Net.HyperLab.CommonModels.Values;
using INAF.Libraries.Net.ScienceModels.Spectra.Interfaces;
using INAF.WebApps.HyperLab.Extensions;
using System.Dynamic;
using static INAF.Libraries.Net.HyperLab.CommonModels.Values.Enums;

namespace INAF.WebApps.HyperLab.Helpers
{
    public sealed class ChartsHelper
    {
        private readonly DbHandlerHyperLabData dbHandlerHyperLabData;

        public ChartsHelper(DbHandlerHyperLabData dbHandlerHyperLabData)
        {
            this.dbHandlerHyperLabData = dbHandlerHyperLabData;
        }

        public ExpandoObject createMultipleSpectraJson(List<ISpectrumModel> spectraModels,
                                                       int operationUserId)
        {
            int idsNum = spectraModels.Count;

            if (spectraModels.Select(x => x.Points).Any(x => x == null || x.Count == 0))
                return new ExpandoObject();

            /* extract min,max for all series and then retrieve absolute min,max */
            (double min, double max) seriesBoundaries = getSeriesBoundaries(spectraModels);

            ExpandoObject resultObject = new ExpandoObject();
            resultObject.AddProperty(nameof(AxisRange), new AxisRange(Enums.Axis.Y, seriesBoundaries.min, seriesBoundaries.max));
            resultObject.AddProperty("SpectraInfo", spectraModels.Select(x => SpectrumInfoModel.Create(x)).ToList());

            /* check if all spectra have the same number of points */
            bool allPointsHaveSameCount = spectraModels.Select(s => s.Points!.Count).Distinct().Count() == 1;
            List<ExpandoObject>? Values = null;
            if (allPointsHaveSameCount)
            {
                /* retrieve x values from 1st spectrum */
                List<double> xValues = spectraModels.First().Points!.Select(x => x.X).ToList();
                Values = addPointsWhenSameCount(idsNum, xValues, spectraModels);
            }
            else
                Values = addPointsWhenDifferentCount(idsNum, spectraModels);

            resultObject.AddProperty("Points", Values);

            return resultObject;
        }

        private List<ExpandoObject> addPointsWhenDifferentCount(int idsNum,
                                                                List<ISpectrumModel> spectraModels)
        {
            var spectrumWithMaxPoints = spectraModels.OrderByDescending(s => s.Points!.Count).First();

            List<double> xValues = spectrumWithMaxPoints.Points!.Select(x => x.X).ToList();

            List<ExpandoObject> Values = new List<ExpandoObject>();
            foreach (var spectrumModel in spectraModels)
            {
                var id = spectrumModel.Id;
                foreach (var xValue in xValues)
                {
                    if (!spectrumModel.Points!.Any(x => x.X == xValue))
                        continue;

                    if (!Values.Any(x => ((IDictionary<string, object>)x!)["X"].Equals(xValue)))
                    {
                        ExpandoObject Value = new ExpandoObject();
                        Value.AddProperty("X", xValue);
                        Value.AddProperty($"id{id}", spectrumModel.Points!.First(y => y.X == xValue).Y);
                        Values.Add(Value);
                    }
                    else
                        Values.FirstOrDefault(x => ((IDictionary<string, object>)x!)["X"].Equals(xValue))?.AddProperty($"id{id}", spectrumModel.Points!.First(y => y.X == xValue).Y);
                }
            }
            return Values;
        }

        private List<ExpandoObject> addPointsWhenSameCount(int idsNum,
                                                           List<double> xValues,
                                                           List<ISpectrumModel> spectraModels)
        {
            List<ExpandoObject> Values = new List<ExpandoObject>();
            foreach (var xValue in xValues)
            {
                ExpandoObject Value = new ExpandoObject();
                Value.AddProperty("X", xValue);
                var infos = spectraModels.Select(x => new { x.Id, x.Points!.First(y => y.X == xValue).Y }).ToList();
                for (int i = 0; i < idsNum; i++)
                {
                    Value.AddProperty($"id{infos[i].Id}", infos[i].Y);
                }
                Values.Add(Value);
            }

            return Values;
        }

        public ExpandoObject? createSingleSpectrumJson(ISpectrumModel spectrumModel)
        {
            /* extract min,max for all series and then retrieve absolute min,max */
            (double min, double max) seriesBoundaries = getSeriesBoundaries(new List<ISpectrumModel> { spectrumModel });

            /* retrieve x values from 1st spectrum */
            List<double> xValues = spectrumModel.Points!.Select(x => x.X).ToList();

            ExpandoObject resultObject = new ExpandoObject();
            resultObject.AddProperty(nameof(AxisRange), new AxisRange(Enums.Axis.Y, seriesBoundaries.min, seriesBoundaries.max));
            resultObject.AddProperty("SpectraInfo", SpectrumInfoModel.Create(spectrumModel));

            List<ExpandoObject> Values = new List<ExpandoObject>();
            foreach (var xValue in xValues)
            {
                ExpandoObject Value = new ExpandoObject();
                Value.AddProperty("X", xValue);
                var infos = new { spectrumModel.Id, spectrumModel.Points!.First(y => y.X == xValue).Y };
                Value.AddProperty($"id{infos.Id}", infos.Y);
                Values.Add(Value);
            }
            resultObject.AddProperty("Points", Values);

            return resultObject;
        }

        public ExpandoObject createRefWhitesJson(List<int> ids,
                                                 int operationUserId)
        {
            //string json = string.Empty;

            int idsNum = ids.Count;

            List<ISpectrumModel>? spectraModels = dbHandlerHyperLabData.getSpectraByIdProcedure(ids,
                                                                                                isPublicSearch: true,
                                                                                                operationUserId);
            if (spectraModels == null || spectraModels.Count == 0)
                return new ExpandoObject();

            /* extract min,max for all series and then retrieve absolute min,max */
            (double min, double max) seriesBoundaries = getSeriesBoundaries(spectraModels);

            /* retrieve x values from 1st spectrum */
            var firstSpectrum = spectraModels.First();
            if (firstSpectrum == null)
                return new ExpandoObject();

            if (firstSpectrum.Points == null || firstSpectrum.Points.Count == 0)
                return new ExpandoObject();
            List<double> xValues = firstSpectrum.Points.Select(x => x.X).ToList();

            ExpandoObject resultObject = new ExpandoObject();
            resultObject.AddProperty(nameof(AxisRange), new AxisRange(Enums.Axis.Y, seriesBoundaries.min, seriesBoundaries.max));
            resultObject.AddProperty("SpectraInfo", spectraModels.Select(x => SpectrumInfoModel.Create(x)).ToList());

            List<ExpandoObject> Values = new List<ExpandoObject>();
            foreach (var spectrumModel in spectraModels)
            {
                if (spectrumModel == null || spectrumModel.Points == null || spectrumModel.Points.Count == 0)
                    continue;

                var id = spectrumModel.Id;
                foreach (var point in spectrumModel.Points)
                {
                    ExpandoObject Value = new ExpandoObject();
                    Value.AddProperty("X", point.X);
                    Value.AddProperty($"id{id}", point.Y);
                    Values.Add(Value);
                }
            }

            Values = Values.OrderBy(x => ((IDictionary<string, object>)x)["X"]).ToList();

            resultObject.AddProperty("Points", Values);

            return resultObject;
        }

        private (double min, double max) getSeriesBoundaries(List<ISpectrumModel> spectraModels)
        {
            /* extract min,max for all series and then retrieve absolute min,max */
            List<AxisRange> axisRanges = new List<AxisRange>(spectraModels.Count);
            foreach (var spectrumModel in spectraModels)
            {
                if (spectrumModel.Points == null || spectrumModel.Points.Count == 0)
                    continue;
                var min = spectrumModel.Points.Min(x => x.Y);
                var max = spectrumModel.Points.Max(x => x.Y);
                axisRanges.Add(new AxisRange(Enums.Axis.Y, min, max));
            }
            double seriesMin = axisRanges.Min(x => x.Min);
            double seriesMax = axisRanges.Max(x => x.Max);

            return (seriesMin, seriesMax);
        }
    }
}

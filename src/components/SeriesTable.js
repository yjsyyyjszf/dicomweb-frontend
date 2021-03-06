import * as React from 'react';
import SeriesItem from './SeriesItem'
import DicomViewer from './DicomViewer'
import MPR from './MPR'
import { Grid } from "@material-ui/core/";
import { makeStyles } from "@material-ui/core/styles";
import _ from 'lodash'
import '../initCornerstone';

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      padding: theme.spacing(2)
    }
  }));

export default function SeriesTable(props) {

    const classes = useStyles();
    const [data, setData] = React.useState([]);
    const [init, setInit] = React.useState(false);
    const [series, setSeries] = React.useState('');
    const [study, setStudy] = React.useState('');
    const [ready, setReady] = React.useState(false);
    const [mpr, setMpr] = React.useState(false);
    
    React.useEffect(() => {
        if (!init) {
            const studyUid = props.match.params.uid;
            find(studyUid);
            setStudy(studyUid)
            setInit(true);
        }
    },[init]);
    
    const find = (value) => {
        const query = `http://localhost:5000/viewer/rs/studies/${value}/series`;
        fetch(query)
        .then(response => response.json())
        .then(data => {
                if(data) {
                    const res = data.map( (row, index) => {
                        return {
                            id: index,
                            seriesDescription: _.get(row, "['0008103E'].Value[0]", 'unnamed'),
                            uid: _.get(row, "['0020000E'].Value[0]", ''),
                        }
                    });
                    setData(res);
                }
            }
        );
    } 
    const onSelectionChange = (e) => {
        setSeries(e.uid);
        setMpr(e.mpr);
        setReady(!e.mpr);
    } 

  return (
    <div>
         <div className={classes.root}>
             <Grid
                container
                spacing={2}
                direction="row"
                justify="flex-start"
                alignItems="flex-start"
                >
                {data.map((elem) => (
                    <Grid item xs={2} key={elem.id}>
                        <SeriesItem id={elem.id} description={elem.seriesDescription} uid={elem.uid} onClick={onSelectionChange}></SeriesItem>
                    </Grid>
                ))}
              </Grid>
          </div>
        <div style={{ flex: 1}}>
        {ready ? <DicomViewer seriesUid={series} studyUid={study}/> : <div></div> }
        {mpr ? <MPR seriesUid={series} studyUid={study}/> : <div></div> }
        </div>
    </div>
  );
}
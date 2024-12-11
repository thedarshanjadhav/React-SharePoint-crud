import { useEffect } from "react";
import * as React from "react";
import { getSP, SPFI } from "../../../pnpjsConfig";
import { ICrudProps } from "./ICrudProps";


export default function Crud(props:ICrudProps) {
  const [data, setData] = React.useState<any[]>([]);
  const _sp:SPFI = getSP(props.spcontext);

  const fetchData = async () => {
    try {
      const getListItems = await _sp.web.lists.getByTitle('CrudOP').items();
      console.log("SharePoint Data:", getListItems);
      const data:any = getListItems.map((item)=>JSON.parse(item.UserData));
      console.log(data)
      setData(data)

      // "{"Name":"Darshan","email":"DJ@clayfly.com","ph":98765456788,"age":30}"


    } catch (err: any) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h1>SharePoint Data</h1>
      <ul>
        {data && data.map((item: any) => (
          <div>
            <li key={item.Id}>{item.Name}</li>
            <li>{item.email}</li>
            <li>{item.ph}</li>
            </div>
        ))}
      </ul>
    </div>
  );
}

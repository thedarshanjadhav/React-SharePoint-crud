import { useEffect } from "react";
import * as React from "react";
import { getSP, SPFI } from "../../../pnpjsConfig";
import { ICrudProps } from "./ICrudProps";
import { v4 as uuidv4 } from "uuid";

export default function Crud(props: ICrudProps) {
  const [formdata, setFromData] = React.useState({
    id: "",
    name: "",
    email: "",
    ph: "",
    age: "",
  });
  const [data, setData] = React.useState<any[]>([]);
  const [editId, setEditId] = React.useState<string | null>(null);
  const _sp: SPFI = getSP(props.spcontext);

  // handle change
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFromData((prev) => ({ ...prev, [name]: value }));
  };

  // handle submit and update
  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("Form Data:", formdata);

    if (editId !== null) {
      let itemToUpdate = null;
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === editId) {
          itemToUpdate = data[i];
          break; 
        }
      }
      if (itemToUpdate) {
        updateDataInSharePoint(itemToUpdate.spId, formdata); 
      }
    } else {
      const newFormData = { ...formdata, id: uuidv4() }; // Add unique id
      sendDataToSharePoint(newFormData);
    }
  };


// handle edit 
  const handleEdit = (id: string) => {
    console.log("Handle Edit ID:", id);
    let itemToEdit = null;
    for (let i = 0; i < data.length; i++) {
      if (data[i].id === id) {
        itemToEdit = data[i];
        break; 
      }
    }
    if (itemToEdit) {
      setFromData(itemToEdit);
      setEditId(id);
      console.log("Item to Edit:", itemToEdit);
    } else {
      console.log("No item found with the given ID");
    }
  };

  // handle delete function
  const handleDelete=(id:any)=>{
    console.log("Handle delete ID:", id);
    let itemToDelete = null;
    for (let i = 0; i < data.length; i++) {
      if (data[i].id === id) {
        itemToDelete = data[i];
        break; 
      }
    }

    if(itemToDelete){
      deleteDataInSharePoint(itemToDelete.spId);
    }else{
      console.log('No item found to delete with the given ID')
    }
  }



  // fetching data from sharepoint
  const fetchDatafromSharepoint = async () => {
    try {
      const getListItems = await _sp.web.lists.getByTitle("test-form").items();
      console.log("SharePoint Data:", getListItems);
      const data: any[] = getListItems.map((item) => ({
        ...JSON.parse(item.userdata0),
        spId: item.Id, 
      }));
      console.log("Fetched Data:", data);
      setData(data);
    } catch (err: any) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchDatafromSharepoint();
  }, []);


  // Function to sending data to sharepoint
  async function sendDataToSharePoint(data: any) {
    try {
      const newItem = await _sp.web.lists
        .getByTitle("test-form")
        .items.add({ userdata0: JSON.stringify(data) });
      console.log("Item added to SharePoint:", newItem);
      fetchDatafromSharepoint();
      setFromData({ id: "", name: "", email: "", ph: "", age: "" });
    } catch (err) {
      console.log("Error adding data:", err);
    }
  }


  // Function to update data to sharepoint
  async function updateDataInSharePoint(spId: number, formdata: any) {
    try {
      await _sp.web.lists.getByTitle("test-form").items.getById(spId).update({
        userdata0: JSON.stringify(formdata),
      });
      console.log("Updated successfully");
      fetchDatafromSharepoint();
      setEditId(null);
      setFromData({ id: "", name: "", email: "", ph: "", age: "" });
    } catch (err) {
      console.log("Error updating data:", err);
    }
  }


  // delete function
  async function deleteDataInSharePoint(spId:any){
    console.log('id in share delete', spId)
    try{
      await _sp.web.lists.getByTitle("test-form").items.getById(spId).delete();
      console.log("deleted successfully");
      fetchDatafromSharepoint();
    }catch(err){
      console.log('getting error while delete item', err);
    }
  }

  return (
    <div>
      <h1>SharePoint Data</h1>
      <div>
        <input
          type="text"
          name="name"
          placeholder="Name"
          onChange={handleChange}
          value={formdata.name}
        />
        <input
          type="text"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          value={formdata.email}
        />
        <input
          type="text"
          name="ph"
          placeholder="Phone"
          onChange={handleChange}
          value={formdata.ph}
        />
        <input
          type="text"
          name="age"
          placeholder="Age"
          onChange={handleChange}
          value={formdata.age}
        />
        <button onClick={handleSubmit}>Submit</button>
      </div>
      <ul>
        {data.map((item) => (
          <div
            key={item.id}
            style={{
              margin: "7px",
              paddingBottom: "5px",
              borderBottom: "2px solid",
            }}
          >
            <li>{item.name}</li>
            <li>{item.email}</li>
            <li>{item.ph}</li>
            <li>{item.age}</li>
            <div style={{display:"flex", gap:'4px'}}>
            <button onClick={() => handleEdit(item.id)}>Edit</button>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
            </div>
          </div>
        ))}
      </ul>
    </div>
  );
}

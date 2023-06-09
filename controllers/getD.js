const Doctor = require("../models/doctor")
const Patient =require("../models/patient")
const Appointment = require("../models/appointment")

const helperfun = (str) => {
    let currentTime = new Date();

    let currentOffset = currentTime.getTimezoneOffset();

    let ISTOffset = 330; // IST offset UTC +5:30

    let ISTTime = new Date(
        currentTime.getTime() + (ISTOffset + currentOffset) * 60000
    );



    let hoursIST = ISTTime.getHours();
    let minutesIST = ISTTime.getMinutes();
    let hours = str.substr(0, 2);
    let minutes = str.substr(3, 2);
    if (hours > hoursIST)
        return true;
    else if(hours == hoursIST)
        return minutes > minutesIST;
    else
        return false;
};
const getSchedule = (req,res) => {
    const {id} = req.params
    Doctor.findById(id, { appointment : 1})
    .then(resp => {
        res.json({array : resp})
    })
}
const getUpcoming = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    let name = await Doctor.findById(id, { name: 1 });
    name = name.name;
    Appointment.find({ idD: id }).then((resp) => {
        let arr = [],
            arr1 = [];
        resp.forEach((appointment) => {
            if (helperfun(appointment.time)) arr.push(appointment);
        });
        if (arr.length > 0) {
            arr.forEach((appointment, indx) => {
                Patient.findById(appointment.idP, { name: 1, spec: 1 }).then((pat) => {
                    arr1.push({
                        id: appointment._id,
                        idP : appointment.idP,
                        idD : id,
                        time: appointment.time,
                        name: pat.name
                    });
                    if (indx === arr.length - 1)
                        res.send({
                            upcoming: arr1,
                            name: name,
                        });
                });
            });
        } else {
            res.send({
                upcoming: [],
                name: name,
            });
        }
    });
};
const updateSchedule = async(req,res) => {
    const {id} = req.params
    let tt= await Doctor.findById(id)
    console.log(req.body)
    tt.appointment=req.body

    Doctor.findByIdAndUpdate(id,tt)
    .then(resp => {
        res.sendStatus(200)
    })
}

module.exports = {getSchedule,updateSchedule,getUpcoming}
import React, { ReactNode, useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, Modal,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
  Alert, ActivityIndicator, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '@/constants/theme';

// ─── BADGE MAP ───────────────────────────────────────────────────────────────
const BADGE_MAP: Record<string, { bg: string; text: string; label: string }> = {
  ACTIVO:{bg:C.successBg,text:C.success,label:'Activo'},ACTIVA:{bg:C.successBg,text:C.success,label:'Activa'},
  INACTIVO:{bg:C.grayBg,text:C.gray,label:'Inactivo'},INACTIVA:{bg:C.grayBg,text:C.gray,label:'Inactiva'},
  PENDIENTE:{bg:C.warningBg,text:C.warning,label:'Pendiente'},
  AUTORIZADO:{bg:C.successBg,text:C.success,label:'Autorizado'},
  RECHAZADO:{bg:C.dangerBg,text:C.danger,label:'Rechazado'},
  RESUELTO:{bg:C.successBg,text:C.success,label:'Resuelto'},
  PERMANENTE:{bg:C.successBg,text:C.success,label:'Permanente'},
  TEMPORAL:{bg:C.warningBg,text:C.warning,label:'Temporal'},
  PRACTICAS:{bg:C.purpleBg,text:C.purple,label:'Prácticas'},
  CONSULTOR:{bg:C.orangeBg,text:C.orange,label:'Consultor'},
  PROGRAMADO:{bg:C.infoBg,text:C.info,label:'Programado'},
  EN_VUELO:{bg:C.successBg,text:C.success,label:'En Vuelo'},
  ATERRIZADO:{bg:C.grayBg,text:C.gray,label:'Aterrizado'},
  CANCELADO:{bg:C.dangerBg,text:C.danger,label:'Cancelado'},
  DEMORADO:{bg:C.warningBg,text:C.warning,label:'Demorado'},
  DESVIADO:{bg:C.orangeBg,text:C.orange,label:'Desviado'},
  REPROGRAMADO:{bg:C.purpleBg,text:C.purple,label:'Reprog.'},
  CONFIRMADA:{bg:C.successBg,text:C.success,label:'Confirmada'},
  CHECK_IN:{bg:C.purpleBg,text:C.purple,label:'Check-In'},
  ABORDADO:{bg:C.tealBg,text:C.teal,label:'Abordado'},
  NO_SHOW:{bg:C.dangerBg,text:C.danger,label:'No Show'},
  RECIBIDO:{bg:C.grayBg,text:C.gray,label:'Recibido'},
  EN_BODEGA:{bg:C.infoBg,text:C.info,label:'En Bodega'},
  CARGADO:{bg:C.purpleBg,text:C.purple,label:'Cargado'},
  DESCARGADO:{bg:C.warningBg,text:C.warning,label:'Descargado'},
  ENTREGADO:{bg:C.successBg,text:C.success,label:'Entregado'},
  ADUANA:{bg:C.orangeBg,text:C.orange,label:'Aduana'},
  EMITIDO:{bg:C.infoBg,text:C.info,label:'Emitido'},
  VALIDADO:{bg:C.successBg,text:C.success,label:'Validado'},
  CERRADO:{bg:C.grayBg,text:C.gray,label:'Cerrado'},
  INFORMATIVO:{bg:C.infoBg,text:C.info,label:'Informativo'},
  PREVENTIVO:{bg:C.warningBg,text:C.warning,label:'Preventivo'},
  CRITICO:{bg:C.dangerBg,text:C.danger,label:'Crítico'},
  EMERGENCIA:{bg:C.dangerBg,text:C.danger,label:'Emergencia'},
  BAJA:{bg:C.successBg,text:C.success,label:'Baja'},
  MEDIA:{bg:C.warningBg,text:C.warning,label:'Media'},
  ALTA:{bg:C.orangeBg,text:C.orange,label:'Alta'},
  URGENTE:{bg:C.dangerBg,text:C.danger,label:'Urgente'},
  ASIGNADO:{bg:C.infoBg,text:C.info,label:'Asignado'},
  EN_PROCESO:{bg:C.warningBg,text:C.warning,label:'En Proceso'},
  COMPLETADO:{bg:C.successBg,text:C.success,label:'Completado'},
  COMPLETADA:{bg:C.successBg,text:C.success,label:'Completada'},
  EN_INVESTIGACION:{bg:C.warningBg,text:C.warning,label:'Investigando'},
  PERSONAL:{bg:C.purpleBg,text:C.purple,label:'Personal'},
  OPERATIVO:{bg:C.infoBg,text:C.info,label:'Operativo'},
  INVERSION:{bg:C.tealBg,text:C.teal,label:'Inversión'},
  MANTENIMIENTO:{bg:C.warningBg,text:C.warning,label:'Mantenimiento'},
  COMBUSTIBLE:{bg:C.orangeBg,text:C.orange,label:'Combustible'},
  TECNOLOGIA:{bg:C.purpleBg,text:C.purple,label:'Tecnología'},
  LIMPIEZA:{bg:C.infoBg,text:C.info,label:'Limpieza'},
  CATERING:{bg:C.successBg,text:C.success,label:'Catering'},
  STAR_ALLIANCE:{bg:C.dangerBg,text:C.danger,label:'Star Alliance'},
  SKYTEAM:{bg:C.purpleBg,text:C.purple,label:'SkyTeam'},
  ONEWORLD:{bg:C.warningBg,text:C.warning,label:'oneworld'},
  NINGUNA:{bg:C.grayBg,text:C.gray,label:'Ninguna'},
  CONFIRMADO:{bg:C.infoBg,text:C.info,label:'Confirmado'},
  PERRO:{bg:C.orangeBg,text:C.orange,label:'🐕 Perro'},
  GATO:{bg:C.purpleBg,text:C.purple,label:'🐈 Gato'},
  AVE:{bg:C.successBg,text:C.success,label:'🦜 Ave'},
  VIGENTE:{bg:C.successBg,text:C.success,label:'Vigente'},
  VENCIDO:{bg:C.dangerBg,text:C.danger,label:'Vencido'},
  TERMINADO:{bg:C.grayBg,text:C.gray,label:'Terminado'},
  SUSPENDIDO:{bg:C.warningBg,text:C.warning,label:'Suspendido'},
  RENOVACION:{bg:C.infoBg,text:C.info,label:'En Renovación'},
  DISPONIBLE:{bg:C.successBg,text:C.success,label:'Disponible'},
  UTILIZADO:{bg:C.grayBg,text:C.gray,label:'Utilizado'},
  ACTIVA_E:{bg:C.dangerBg,text:C.danger,label:'ACTIVA'},
  FINALIZADA:{bg:C.grayBg,text:C.gray,label:'Finalizada'},
  PILOTO:{bg:C.infoBg,text:C.navy,label:'Piloto'},
  COPILOTO:{bg:C.tealBg,text:C.teal,label:'Copiloto'},
  SOBRECARGO:{bg:C.purpleBg,text:C.purple,label:'Sobrecargo'},
  INGENIERO:{bg:C.warningBg,text:C.warning,label:'Ingeniero'},
  AUXILIAR:{bg:C.grayBg,text:C.gray,label:'Auxiliar'},
  VACACIONES:{bg:C.infoBg,text:C.info,label:'Vacaciones'},
  PERMISO:{bg:C.warningBg,text:C.warning,label:'Permiso'},
  LICENCIA:{bg:C.purpleBg,text:C.purple,label:'Licencia'},
  INCAPACIDAD:{bg:C.dangerBg,text:C.danger,label:'Incapacidad'},
  GENERADO:{bg:C.infoBg,text:C.info,label:'Generado'},
  ENVIADO:{bg:C.purpleBg,text:C.purple,label:'Enviado'},
  PREVENTIVO_M:{bg:C.infoBg,text:C.info,label:'Preventivo'},
  CORRECTIVO:{bg:C.warningBg,text:C.warning,label:'Correctivo'},
  PREDICTIVO:{bg:C.purpleBg,text:C.purple,label:'Predictivo'},
  MAYOR:{bg:C.dangerBg,text:C.danger,label:'Mayor'},
  JET_A:{bg:C.orangeBg,text:C.orange,label:'JET-A'},
  JET_A1:{bg:C.orangeBg,text:C.orange,label:'JET-A1'},
  JET_B:{bg:C.warningBg,text:C.warning,label:'JET-B'},
  AVGAS:{bg:C.infoBg,text:C.info,label:'AVGAS'},
  TASA_EMBARQUE:{bg:C.infoBg,text:C.info,label:'Tasa Embarq.'},
  CONCESIONES:{bg:C.successBg,text:C.success,label:'Concesiones'},
  ESTACIONAMIENTO:{bg:C.purpleBg,text:C.purple,label:'Estacion.'},
  PUBLICIDAD:{bg:C.orangeBg,text:C.orange,label:'Publicidad'},
  SERVICIOS:{bg:C.infoBg,text:C.info,label:'Servicios'},
  SUMINISTROS:{bg:C.orangeBg,text:C.orange,label:'Suministros'},
  SEGURIDAD:{bg:C.dangerBg,text:C.danger,label:'Seguridad'},
  MANTENIMIENTO_T:{bg:C.warningBg,text:C.warning,label:'Mantenim.'},
  FRECUENTE:{bg:C.purpleBg,text:C.purple,label:'Frecuente'},
  OCASIONAL:{bg:C.grayBg,text:C.gray,label:'Ocasional'},
  VIP:{bg:C.warningBg,text:C.warning,label:'VIP'},
  CORPORATIVO:{bg:C.infoBg,text:C.info,label:'Corporativo'},
  MASCULINO:{bg:C.infoBg,text:C.info,label:'Masculino'},
  FEMENINO:{bg:C.pinkBg,text:C.pink,label:'Femenino'},
  OTRO:{bg:C.grayBg,text:C.gray,label:'Otro'},
  NACIONAL:{bg:C.successBg,text:C.success,label:'Nacional'},
  INTERNACIONAL:{bg:C.infoBg,text:C.info,label:'Internacional'},
  MIXTA:{bg:C.purpleBg,text:C.purple,label:'Mixta'},
  DPI:{bg:C.tealBg,text:C.teal,label:'DPI'},
  PASAPORTE:{bg:C.infoBg,text:C.info,label:'Pasaporte'},
};
const FALLBACK = {bg:C.grayBg,text:C.gray};

export function Badge({value}:{value:string|number|undefined}) {
  if (value==null) return null;
  const k = String(value).toUpperCase().replace(/ /g,'_');
  const cfg = BADGE_MAP[k]??{...FALLBACK,label:String(value).replace(/_/g,' ')};
  return (
    <View style={{backgroundColor:cfg.bg,paddingHorizontal:9,paddingVertical:3,borderRadius:99}}>
      <Text style={{fontSize:10,fontWeight:'700',color:cfg.text,letterSpacing:0.3}}>
        {(cfg as any).label?.toUpperCase()??String(value)}
      </Text>
    </View>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────
export function StatCard({label,value,color=C.navy,bg=C.infoBg,icon}:{label:string;value:string|number;color?:string;bg?:string;icon?:string}) {
  return (
    <View style={[sc.card,{borderTopColor:color}]}>
      <View style={[sc.iconWrap,{backgroundColor:bg}]}>
        <Text style={{fontSize:18}}>{icon??'📊'}</Text>
      </View>
      <Text style={[sc.val,{color}]}>{value}</Text>
      <Text style={sc.lbl} numberOfLines={1}>{label}</Text>
    </View>
  );
}
const sc=StyleSheet.create({
  card:{backgroundColor:C.bgCard,borderRadius:14,borderTopWidth:3,paddingHorizontal:10,paddingVertical:12,alignItems:'center',flex:1,minWidth:70,gap:4,elevation:3,shadowColor:'#000',shadowOffset:{width:0,height:3},shadowOpacity:0.4,shadowRadius:8,borderWidth:1,borderColor:C.border},
  iconWrap:{width:38,height:38,borderRadius:10,alignItems:'center',justifyContent:'center'},
  val:{fontSize:20,fontWeight:'800',lineHeight:24},
  lbl:{fontSize:10,color:C.muted,fontWeight:'600',textAlign:'center'},
});

// ─── DATA CARD ───────────────────────────────────────────────────────────────
export function DataCard({title,subtitle,badge,meta,onEdit,onDelete,accentColor=C.navy,children}:{
  title:string;subtitle?:string;badge?:ReactNode;meta?:string;
  onEdit?:()=>void;onDelete?:()=>void;accentColor?:string;children?:ReactNode;
}) {
  const handleDelete = () => {
    if (onDelete) Alert.alert('Eliminar registro','¿Estás seguro? Esta acción no se puede deshacer.',[
      {text:'Cancelar',style:'cancel'},
      {text:'Eliminar',style:'destructive',onPress:onDelete},
    ]);
  };
  return (
    <View style={[dc.card,{borderLeftColor:accentColor}]}>
      <View style={dc.top}>
        <View style={[dc.accentDot,{backgroundColor:accentColor+'22'}]}>
          <View style={[dc.dot,{backgroundColor:accentColor}]}/>
        </View>
        <View style={dc.info}>
          <Text style={dc.title} numberOfLines={2}>{title}</Text>
          {subtitle?<Text style={dc.sub} numberOfLines={2}>{subtitle}</Text>:null}
        </View>
        <View style={dc.right}>
          {badge}
          {meta?<Text style={dc.meta}>{meta}</Text>:null}
        </View>
      </View>
      {children?<View style={dc.body}>{children}</View>:null}
      {(onEdit||onDelete)&&(
        <View style={dc.actions}>
          {onEdit&&<TouchableOpacity style={dc.eBtn} onPress={onEdit} activeOpacity={0.75}><Text style={dc.eT}>✏️  Editar</Text></TouchableOpacity>}
          {onDelete&&<TouchableOpacity style={dc.dBtn} onPress={handleDelete} activeOpacity={0.75}><Text style={dc.dT}>🗑️  Eliminar</Text></TouchableOpacity>}
        </View>
      )}
    </View>
  );
}
const dc=StyleSheet.create({
  card:{backgroundColor:C.bgCard,borderRadius:16,marginBottom:10,borderLeftWidth:4,paddingHorizontal:14,paddingVertical:14,elevation:2,shadowColor:C.shadow,shadowOffset:{width:0,height:2},shadowOpacity:1,shadowRadius:8},
  top:{flexDirection:'row',alignItems:'flex-start',gap:10},
  accentDot:{width:30,height:30,borderRadius:8,alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2},
  dot:{width:10,height:10,borderRadius:3},
  info:{flex:1},
  right:{alignItems:'flex-end',gap:5,flexShrink:0,maxWidth:120},
  title:{fontSize:15,fontWeight:'700',color:C.text,lineHeight:20,flexWrap:'wrap'},
  sub:{fontSize:12,color:C.muted,marginTop:3,lineHeight:17},
  meta:{fontSize:12,fontWeight:'700',color:C.textSub,marginTop:3},
  body:{marginTop:12,borderTopWidth:1,borderTopColor:C.borderL,paddingTop:10},
  actions:{flexDirection:'row',gap:8,marginTop:10,borderTopWidth:1,borderTopColor:C.borderL,paddingTop:10},
  eBtn:{flex:1,paddingVertical:8,borderRadius:10,borderWidth:1.5,borderColor:C.border,alignItems:'center',backgroundColor:C.bgElevated},
  eT:{fontSize:13,fontWeight:'600',color:C.textSub},
  dBtn:{flex:1,paddingVertical:8,borderRadius:10,backgroundColor:C.dangerBg,alignItems:'center',borderWidth:1.5,borderColor:C.dangerL},
  dT:{fontSize:13,fontWeight:'600',color:C.danger},
});

// ─── FORM MODAL ──────────────────────────────────────────────────────────────
export function FormModal({visible,title,onClose,onSave,saveLabel='Guardar',children,loading}:{
  visible:boolean;title:string;onClose:()=>void;onSave:()=>void;
  saveLabel?:string;children:ReactNode;loading?:boolean;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={fm.overlay} behavior={Platform.OS==='ios'?'padding':'height'}>
        <TouchableOpacity style={fm.back} activeOpacity={1} onPress={onClose}/>
        <View style={fm.sheet}>
          <View style={fm.handle}/>
          <View style={fm.hdr}>
            <Text style={fm.ttl}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={fm.cls} activeOpacity={0.75}>
              <Text style={fm.clsT}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={fm.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {children}
            <View style={{height:20}}/>
          </ScrollView>
          <View style={fm.ftr}>
            <TouchableOpacity style={fm.canBtn} onPress={onClose} activeOpacity={0.75}>
              <Text style={fm.canT}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[fm.savBtn,loading&&{opacity:0.7}]} onPress={onSave} activeOpacity={0.85} disabled={loading}>
              {loading?<ActivityIndicator color={C.white} size="small"/>:<Text style={fm.savT}>{saveLabel}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const fm=StyleSheet.create({
  overlay:{flex:1,justifyContent:'flex-end'},
  back:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(0,0,0,0.5)'},
  sheet:{backgroundColor:C.bgCard,borderTopLeftRadius:24,borderTopRightRadius:24,maxHeight:'92%',elevation:20,shadowColor:C.shadowMd,shadowOffset:{width:0,height:-4},shadowOpacity:1,shadowRadius:20},
  handle:{width:40,height:4,backgroundColor:C.border,borderRadius:2,alignSelf:'center',marginTop:12,marginBottom:2},
  hdr:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:20,paddingVertical:16,borderBottomWidth:1,borderBottomColor:C.borderL},
  ttl:{fontSize:17,fontWeight:'800',color:C.text,flex:1},
  cls:{width:32,height:32,borderRadius:16,backgroundColor:C.bg,alignItems:'center',justifyContent:'center'},
  clsT:{fontSize:13,color:C.muted,fontWeight:'700'},
  body:{paddingHorizontal:20,paddingTop:18},
  ftr:{flexDirection:'row',gap:10,padding:16,borderTopWidth:1,borderTopColor:C.borderL},
  canBtn:{flex:1,paddingVertical:14,borderRadius:12,borderWidth:1.5,borderColor:C.border,alignItems:'center',backgroundColor:C.bgElevated},
  canT:{color:C.muted,fontWeight:'700',fontSize:15},
  savBtn:{flex:2,paddingVertical:14,borderRadius:12,backgroundColor:C.electric,alignItems:'center'},
  savT:{color:C.white,fontWeight:'800',fontSize:15},
});

// ─── FORM SECTION TITLE ──────────────────────────────────────────────────────
export function FormSection({title,icon}:{title:string;icon?:string}) {
  return (
    <View style={{flexDirection:'row',alignItems:'center',gap:6,marginTop:18,marginBottom:10,paddingBottom:8,borderBottomWidth:1.5,borderBottomColor:C.borderL}}>
      {icon&&<Text style={{fontSize:16}}>{icon}</Text>}
      <Text style={{fontSize:13,fontWeight:'800',color:C.electric,textTransform:'uppercase',letterSpacing:0.5}}>{title}</Text>
    </View>
  );
}

// ─── FORM FIELD ──────────────────────────────────────────────────────────────
export function FF({label,required,hint,...props}:{label:string;required?:boolean;hint?:string}&any) {
  const [focused,setFocused]=useState(false);
  return (
    <View style={{marginBottom:16}}>
      <Text style={{fontSize:12,fontWeight:'700',color:focused?C.electric:C.muted,textTransform:'uppercase',letterSpacing:0.5,marginBottom:7}}>
        {label}{required?<Text style={{color:C.danger}}> *</Text>:null}
      </Text>
      <TextInput
        style={{borderWidth:1.5,borderColor:focused?C.electric:C.border,borderRadius:12,paddingHorizontal:14,paddingVertical:11,fontSize:15,color:C.text,backgroundColor:focused?C.bgElevated:C.bgElevated,...(props.multiline?{minHeight:80,textAlignVertical:'top'}:{})}}
        placeholderTextColor={C.placeholder}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        {...props}
      />
      {hint?<Text style={{fontSize:11,color:C.light,marginTop:4,marginLeft:2}}>{hint}</Text>:null}
    </View>
  );
}

// ─── SELECT PICKER ───────────────────────────────────────────────────────────
export function FSelect({label,value,options,onChange,required,hint}:{
  label:string;value:string;options:{label:string;value:string}[];
  onChange:(v:string)=>void;required?:boolean;hint?:string;
}) {
  const [open,setOpen]=useState(false);
  const selected = options.find(o=>o.value===value);
  return (
    <View style={{marginBottom:16}}>
      <Text style={{fontSize:12,fontWeight:'700',color:C.muted,textTransform:'uppercase',letterSpacing:0.5,marginBottom:7}}>
        {label}{required?<Text style={{color:C.danger}}> *</Text>:null}
      </Text>
      <TouchableOpacity
        style={{borderWidth:1.5,borderColor:open?C.electric:C.border,borderRadius:12,paddingHorizontal:14,paddingVertical:12,backgroundColor:C.bgElevated,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}
        onPress={()=>setOpen(true)} activeOpacity={0.75}
      >
        <Text style={{fontSize:15,color:selected?C.text:C.placeholder,flex:1}}>
          {selected?.label??`Seleccionar ${label.toLowerCase()}`}
        </Text>
        <Text style={{color:C.muted,fontSize:16}}>▾</Text>
      </TouchableOpacity>
      {hint?<Text style={{fontSize:11,color:C.light,marginTop:4,marginLeft:2}}>{hint}</Text>:null}
      <Modal visible={open} transparent animationType="fade" onRequestClose={()=>setOpen(false)}>
        <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.45)',justifyContent:'center',padding:24}} activeOpacity={1} onPress={()=>setOpen(false)}>
          <View style={{backgroundColor:C.bgElevated,borderRadius:20,overflow:'hidden',maxHeight:420}}>
            <View style={{padding:16,borderBottomWidth:1,borderBottomColor:C.borderL}}>
              <Text style={{fontSize:16,fontWeight:'800',color:C.text}}>{label}</Text>
            </View>
            <FlatList
              data={options} keyExtractor={o=>o.value}
              renderItem={({item})=>(
                <TouchableOpacity
                  style={{flexDirection:'row',alignItems:'center',paddingHorizontal:20,paddingVertical:14,borderBottomWidth:1,borderBottomColor:C.borderL,backgroundColor:value===item.value?C.infoBg:C.bgElevated}}
                  onPress={()=>{onChange(item.value);setOpen(false);}}
                  activeOpacity={0.75}
                >
                  {value===item.value&&<Text style={{color:C.electric,marginRight:10,fontSize:16}}>✓</Text>}
                  <Text style={{fontSize:15,fontWeight:value===item.value?'700':'500',color:value===item.value?C.electric:C.text}}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ─── TOGGLE FIELD ────────────────────────────────────────────────────────────
export function FToggle({label,value,onChange,hint}:{label:string;value:boolean;onChange:(v:boolean)=>void;hint?:string}) {
  return (
    <View style={{marginBottom:16}}>
      <TouchableOpacity style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:C.bgElevated,borderWidth:1.5,borderColor:C.border,borderRadius:12,paddingHorizontal:14,paddingVertical:12}} onPress={()=>onChange(!value)} activeOpacity={0.8}>
        <View style={{flex:1}}>
          <Text style={{fontSize:14,fontWeight:'600',color:C.text}}>{label}</Text>
          {hint&&<Text style={{fontSize:11,color:C.muted,marginTop:2}}>{hint}</Text>}
        </View>
        <View style={{width:48,height:28,borderRadius:14,backgroundColor:value?C.electric:C.grayL,justifyContent:'center',paddingHorizontal:3}}>
          <View style={{width:22,height:22,borderRadius:11,backgroundColor:C.white,alignSelf:value?'flex-end':'flex-start',elevation:2,shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.2,shadowRadius:2}}/>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// ─── SEARCH BAR ──────────────────────────────────────────────────────────────
export function SearchBar({value,onChangeText,placeholder='Buscar...'}:{value:string;onChangeText:(t:string)=>void;placeholder?:string}) {
  return (
    <View style={{paddingHorizontal:14,paddingVertical:10,backgroundColor:C.bgCard,borderBottomWidth:1,borderBottomColor:C.borderL}}>
      <View style={{backgroundColor:C.bg,borderRadius:12,flexDirection:'row',alignItems:'center',paddingHorizontal:12,borderWidth:1.5,borderColor:C.borderL}}>
        <Text style={{fontSize:16,marginRight:8,color:C.light}}>🔍</Text>
        <TextInput style={{flex:1,paddingVertical:10,fontSize:15,color:C.text}} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={C.placeholder} clearButtonMode="while-editing"/>
        {value.length>0&&Platform.OS==='android'&&(
          <TouchableOpacity onPress={()=>onChangeText('')} style={{padding:4}}>
            <Text style={{color:C.muted,fontSize:16}}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── SCREEN HEADER ───────────────────────────────────────────────────────────
export function ScreenHeader({title,subtitle,onAdd,addLabel='+ Nuevo',showBack=true}:{title:string;subtitle?:string;onAdd?:()=>void;addLabel?:string;showBack?:boolean}) {
  const router=useRouter();
  return (
    <View style={sh.wrap}>
      <View style={sh.left}>
        {showBack&&(
          <TouchableOpacity onPress={()=>router.back()} style={sh.back} activeOpacity={0.75}>
            <Text style={sh.backT}>‹</Text>
          </TouchableOpacity>
        )}
        <View style={{flex:1}}>
          <Text style={sh.title} numberOfLines={1}>{title}</Text>
          {subtitle&&<Text style={sh.sub} numberOfLines={1}>{subtitle}</Text>}
        </View>
      </View>
      {onAdd&&<TouchableOpacity style={sh.addBtn} onPress={onAdd} activeOpacity={0.85}><Text style={sh.addT}>{addLabel}</Text></TouchableOpacity>}
    </View>
  );
}
const sh=StyleSheet.create({
  wrap:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingTop:12,paddingBottom:12,backgroundColor:C.bgCard,borderBottomWidth:1,borderBottomColor:C.borderL,elevation:2,shadowColor:C.shadow,shadowOffset:{width:0,height:1},shadowOpacity:1,shadowRadius:4},
  left:{flexDirection:'row',alignItems:'center',gap:8,flex:1,overflow:'hidden'},
  back:{width:36,height:36,borderRadius:10,backgroundColor:C.bg,alignItems:'center',justifyContent:'center',flexShrink:0,borderWidth:1,borderColor:C.border},
  backT:{fontSize:22,color:C.navy,fontWeight:'300',marginTop:-2},
  title:{fontSize:15,fontWeight:'800',color:C.text,flexShrink:1},
  sub:{fontSize:11,color:C.muted,marginTop:1,fontWeight:'500'},
  addBtn:{backgroundColor:C.navy,paddingHorizontal:14,paddingVertical:9,borderRadius:10,flexShrink:0,elevation:2,shadowColor:C.navy,shadowOffset:{width:0,height:2},shadowOpacity:0.3,shadowRadius:4},
  addT:{color:C.white,fontSize:13,fontWeight:'700'},
});

// ─── TAB BAR ─────────────────────────────────────────────────────────────────
export function TabBar({tabs,active,onPress}:{tabs:{k:string;l:string}[];active:string;onPress:(k:string)=>void}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}
      style={{backgroundColor:C.bgCard,borderBottomWidth:1,borderBottomColor:C.borderL}}
      contentContainerStyle={{paddingHorizontal:12,paddingVertical:6,gap:6}}>
      {tabs.map(t=>(
        <TouchableOpacity key={t.k} onPress={()=>onPress(t.k)}
          style={[tb.tab,active===t.k&&tb.tabActive]} activeOpacity={0.75}>
          <Text style={[tb.text,active===t.k&&tb.textActive]}>{t.l}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
const tb=StyleSheet.create({
  tab:{paddingHorizontal:14,paddingVertical:7,borderRadius:99,backgroundColor:C.bg,borderWidth:1.5,borderColor:'transparent'},
  tabActive:{backgroundColor:C.navy,borderColor:C.navy},
  text:{fontSize:12,fontWeight:'600',color:C.muted},
  textActive:{color:C.white,fontWeight:'700'},
});

// ─── STATS ROW ───────────────────────────────────────────────────────────────
export function StatsRow({children}:{children:ReactNode}) {
  return (
    <View style={{flexDirection:'row',gap:8,padding:12,backgroundColor:C.bgCard,borderBottomWidth:1,borderBottomColor:C.borderL,flexWrap:'nowrap',alignItems:'stretch'}}>
      {children}
    </View>
  );
}

// ─── MODULE HUB CARD ─────────────────────────────────────────────────────────
export function ModuleHubCard({title,desc,onPress,color,bg,icon}:{title:string;desc:string;onPress:()=>void;color:string;bg:string;icon:string}) {
  return (
    <TouchableOpacity style={[mhc.card,{borderLeftColor:color}]} onPress={onPress} activeOpacity={0.8}>
      <View style={[mhc.iconWrap,{backgroundColor:bg}]}><Text style={{fontSize:22}}>{icon}</Text></View>
      <View style={mhc.info}>
        <Text style={mhc.title} numberOfLines={1}>{title}</Text>
        <Text style={mhc.desc} numberOfLines={2}>{desc}</Text>
      </View>
      <View style={[mhc.arrow,{backgroundColor:color+'15'}]}>
        <Text style={[mhc.arrowT,{color}]}>›</Text>
      </View>
    </TouchableOpacity>
  );
}
const mhc=StyleSheet.create({
  card:{backgroundColor:C.bgCard,borderRadius:14,marginBottom:8,borderLeftWidth:4,paddingHorizontal:14,paddingVertical:14,flexDirection:'row',alignItems:'center',gap:12,elevation:2,shadowColor:C.shadow,shadowOffset:{width:0,height:1},shadowOpacity:1,shadowRadius:6},
  iconWrap:{width:46,height:46,borderRadius:13,alignItems:'center',justifyContent:'center',flexShrink:0},
  info:{flex:1},
  title:{fontSize:14,fontWeight:'700',color:C.text,flexWrap:'wrap'},
  desc:{fontSize:12,color:C.muted,marginTop:3,lineHeight:17},
  arrow:{width:28,height:28,borderRadius:8,alignItems:'center',justifyContent:'center',flexShrink:0},
  arrowT:{fontSize:20,fontWeight:'300',marginTop:-1},
});

// ─── INFO ROW ─────────────────────────────────────────────────────────────────
export function InfoRow({label,value,mono,highlight}:{label:string;value?:string|number;mono?:boolean;highlight?:boolean}) {
  return (
    <View style={{flexDirection:'row',paddingVertical:9,borderBottomWidth:1,borderBottomColor:C.borderL,gap:8,alignItems:'flex-start'}}>
      <Text style={{fontSize:12,color:C.muted,flex:0.45,fontWeight:'500'}}>{label}</Text>
      <Text style={{fontSize:12,fontWeight:highlight?'700':'600',color:highlight?C.navy:C.textSub,flex:0.55,fontFamily:mono?'monospace':undefined}}>{value??'—'}</Text>
    </View>
  );
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
export function ProgressBar({value,max,color,label}:{value:number;max:number;color?:string;label?:string}) {
  const pct=max>0?Math.min((value/max)*100,100):0;
  const c=color??(pct>=90?C.danger:pct>=70?C.warning:C.success);
  return (
    <View>
      <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:5}}>
        <Text style={{fontSize:11,color:C.muted,fontWeight:'500'}}>{label??`${value.toLocaleString()} / ${max.toLocaleString()}`}</Text>
        <Text style={{fontSize:11,fontWeight:'700',color:c}}>{pct.toFixed(0)}%</Text>
      </View>
      <View style={{height:8,backgroundColor:C.bg,borderRadius:4,overflow:'hidden'}}>
        <View style={{height:8,width:`${pct}%` as any,backgroundColor:c,borderRadius:4}}/>
      </View>
    </View>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
export function EmptyState({icon='📋',text='Sin registros',sub}:{icon?:string;text?:string;sub?:string}) {
  return (
    <View style={{alignItems:'center',paddingVertical:60,paddingHorizontal:40}}>
      <View style={{width:80,height:80,borderRadius:20,backgroundColor:C.bg,alignItems:'center',justifyContent:'center',marginBottom:16}}>
        <Text style={{fontSize:40}}>{icon}</Text>
      </View>
      <Text style={{fontSize:16,fontWeight:'700',color:C.textSub,textAlign:'center'}}>{text}</Text>
      {sub&&<Text style={{fontSize:13,color:C.muted,marginTop:6,textAlign:'center',lineHeight:20}}>{sub}</Text>}
    </View>
  );
}

// ─── SCORE BAR ───────────────────────────────────────────────────────────────
export function ScoreBar({label,value,max=5}:{label:string;value:number;max?:number}) {
  const pct=(value/max)*100;
  const c=value>=4?C.success:value>=3?C.warning:C.danger;
  return (
    <View style={{marginBottom:10}}>
      <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:5}}>
        <Text style={{fontSize:12,color:C.muted,fontWeight:'500'}}>{label}</Text>
        <Text style={{fontSize:12,fontWeight:'800',color:c}}>{value.toFixed(1)}/{max}</Text>
      </View>
      <View style={{height:6,backgroundColor:C.bg,borderRadius:3,overflow:'hidden'}}>
        <View style={{height:6,width:`${pct}%` as any,backgroundColor:c,borderRadius:3}}/>
      </View>
    </View>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
export function SectionHeader({title,count}:{title:string;count?:number}) {
  return (
    <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingTop:18,paddingBottom:8}}>
      <Text style={{fontSize:13,fontWeight:'800',color:C.navy,flex:1,textTransform:'uppercase',letterSpacing:0.5}}>{title}</Text>
      {count!=null&&<View style={{backgroundColor:C.bg,paddingHorizontal:8,paddingVertical:2,borderRadius:99,borderWidth:1,borderColor:C.border}}><Text style={{fontSize:11,fontWeight:'700',color:C.muted}}>{count}</Text></View>}
    </View>
  );
}

// ─── ALERT BANNER ────────────────────────────────────────────────────────────
export function AlertBanner({type,message}:{type:'info'|'success'|'warning'|'error';message:string}) {
  const map={
    info:{bg:C.infoBg,border:C.infoL,text:C.info,icon:'ℹ️'},
    success:{bg:C.successBg,border:C.successL,text:C.success,icon:'✅'},
    warning:{bg:C.warningBg,border:C.warningL,text:C.warning,icon:'⚠️'},
    error:{bg:C.dangerBg,border:C.dangerL,text:C.danger,icon:'🚫'},
  };
  const cfg=map[type];
  return (
    <View style={{flexDirection:'row',gap:10,backgroundColor:cfg.bg,borderWidth:1,borderColor:cfg.border,borderRadius:10,padding:12,marginHorizontal:14,marginBottom:8,alignItems:'flex-start'}}>
      <Text style={{fontSize:14}}>{cfg.icon}</Text>
      <Text style={{flex:1,fontSize:13,color:cfg.text,fontWeight:'600',lineHeight:18}}>{message}</Text>
    </View>
  );
}

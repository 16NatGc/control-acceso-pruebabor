import React from 'react';
import { useParams } from 'react-router-dom';
import ResidenteView from './ResidenteView';
import MantenimientoView from './MantenimientoView';
import VigilanteView from './VigilanteView';
import VisitanteView from './VisitanteView';

const RolePanel = () => {
    const { role } = useParams();

    const renderRoleView = () => {
        switch (parseInt(role)) {
            case 2:
                return <ResidenteView />;
            case 3:
                return <MantenimientoView />;
            case 4:
                return <VigilanteView />;
            case 5:
                return <VisitanteView />;
            default:
                return <p>Rol no reconocido.</p>;
        }
    };

    return (
        <div>
            {renderRoleView()} {/* Llama a renderRoleView para renderizar el componente */}
        </div>
    );
};

export default RolePanel;